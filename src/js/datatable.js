import { Component } from './base.js';
import { fromHTML } from './dom.js';

const TEMPLATE = `
  <div class="datatable-shell">
    <div class="datatable-corner" role="button" aria-label="Select all cells" tabindex="0">
      <span class="datatable-corner-mark" aria-hidden="true"></span>
      <span class="datatable-resize-handle" data-role="all-handle" aria-hidden="true"></span>
    </div>
    <div class="datatable-header-layer" aria-hidden="true"></div>
    <div class="datatable-gutter-layer" aria-hidden="true"></div>
    <div class="datatable-viewport" tabindex="0" role="grid">
      <div class="datatable-canvas"></div>
    </div>
  </div>
  <div class="datatable-measurer" aria-hidden="true">
    <div class="datatable-header-cell datatable-measure-cell"><span class="datatable-label"></span></div>
    <div class="datatable-cell datatable-measure-cell"><span class="datatable-label"></span></div>
  </div>
`;

const clamp = (value, min, max = Infinity) => Math.max(min, Math.min(max, value));
const finiteNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const columnLabel = (column, index) => {
  if (typeof column === 'string') return column;
  return String(column?.label ?? column?.name ?? column?.title ?? column?.key ?? `Column ${index + 1}`);
};

const columnKey = (column, index) => {
  if (typeof column === 'string') return column;
  return column?.key ?? column?.field ?? column?.id ?? index;
};

const parseJsonSource = (value) => {
  if (typeof value !== 'string' || !value.startsWith('#') || typeof document === 'undefined') return value;
  const source = document.querySelector(value);
  if (!source) return null;
  try {
    return JSON.parse(source.textContent);
  } catch {
    return null;
  }
};

/**
 * DataTable — a virtualised spreadsheet-ish grid for huge datasets.
 *
 * Rows and columns are windowed in both directions, widths are fixed by default,
 * and expensive work only happens on demand: resize a column, double-click to
 * auto-size it, or select the top-left gutter and auto-size the whole sheet.
 */
export class DataTable extends Component {
  static NAME = 'datatable';
  static Default = {
    columns: null,
    rows: null,
    columnCount: 0,
    rowCount: 0,
    defaultColumnWidth: 192,
    minColumnWidth: 72,
    maxAutoWidth: 512,
    autoSizeSample: 48,
    rowHeight: 40,
    headerHeight: 44,
    gutterWidth: 56,
    overscan: 2,
    selectable: true,
    getColumnLabel: null,
    getCell: null,
    getRow: null,
  };

  constructor(element, config) {
    super(element, config);
    this._element.classList.add('datatable');
    this._element.innerHTML = TEMPLATE;

    this._shell = this._element.querySelector('.datatable-shell');
    this._corner = this._element.querySelector('.datatable-corner');
    this._headerLayer = this._element.querySelector('.datatable-header-layer');
    this._gutterLayer = this._element.querySelector('.datatable-gutter-layer');
    this._viewport = this._element.querySelector('.datatable-viewport');
    this._canvas = this._element.querySelector('.datatable-canvas');
    this._measurer = this._element.querySelector('.datatable-measurer');
    this._measureHeader = this._measurer.children[0];
    this._measureCell = this._measurer.children[1];

    this._headerPool = [];
    this._gutterPool = [];
    this._cellPool = [];
    this._frame = 0;
    this._renderState = { rowStart: -1, rowEnd: -1, colStart: -1, colEnd: -1, width: -1, height: -1 };
    this._selectedAll = false;
    this._resize = null;
    this._pendingWidth = 0;
    this._measureContext = undefined;
    this._metrics = null;
    this._widthFrame = 0;

    this._onScroll = () => this._scheduleRender();
    this._onResize = () => this._scheduleRender(true);
    this._onClick = this._handleClick.bind(this);
    this._onKeydown = this._handleKeydown.bind(this);
    this._onDoubleClick = this._handleDoubleClick.bind(this);
    this._onPointerDown = this._handlePointerDown.bind(this);
    this._onPointerMove = this._handlePointerMove.bind(this);
    this._onPointerUp = this._handlePointerUp.bind(this);

    this._viewport.addEventListener('scroll', this._onScroll, { passive: true });
    this._element.addEventListener('click', this._onClick);
    this._element.addEventListener('keydown', this._onKeydown);
    this._element.addEventListener('dblclick', this._onDoubleClick);
    this._element.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('resize', this._onResize);

    this._setData(this._config);
  }

  get rowCount() {
    return this._rowCount;
  }

  get columnCount() {
    return this._columnCount;
  }

  get selectedAll() {
    return this._selectedAll;
  }

  setData(config = {}) {
    this._config = { ...this._config, ...config };
    this._setData(this._config);
    return this;
  }

  resizeColumn(index, width, { silent = false } = {}) {
    if (index < 0 || index >= this._columnCount) return this;
    const next = Math.max(this._minColumnWidth, Math.round(width));
    if (this._columnWidths[index] === next) return this;
    if (!silent && !this._emit('columnresize', { column: index, width: next }, true)) return this;
    this._columnWidths[index] = next;
    this._rebuildOffsets(index);
    this._syncGeometry();
    this._scheduleRender(true);
    if (!silent) this._emit('columnresized', { column: index, width: next });
    return this;
  }

  autoSizeColumn(index) {
    if (index < 0 || index >= this._columnCount) return this;
    this._primeMetrics();
    const width = this._measureColumn(index);
    return this.resizeColumn(index, width);
  }

  autoSizeAll() {
    if (!this._emit('autosize', { columns: this._columnCount }, true)) return this;
    this._primeMetrics();
    for (let i = 0; i < this._columnCount; i += 1) {
      this._columnWidths[i] = this._measureColumn(i);
    }
    this._rebuildOffsets(0);
    this._syncGeometry();
    this._scheduleRender(true);
    this._emit('autosized', { columns: this._columnCount });
    return this;
  }

  selectAll(selected = true) {
    if (this._selectedAll === selected) return this;
    if (!this._emit('selectall', { selected }, true)) return this;
    this._selectedAll = selected;
    this._element.classList.toggle('is-table-selected', selected);
    this._corner.setAttribute('aria-pressed', selected ? 'true' : 'false');
    this._scheduleRender(true);
    this._emit('selectallchanged', { selected });
    return this;
  }

  dispose() {
    this._viewport.removeEventListener('scroll', this._onScroll);
    this._element.removeEventListener('click', this._onClick);
    this._element.removeEventListener('keydown', this._onKeydown);
    this._element.removeEventListener('dblclick', this._onDoubleClick);
    this._element.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('resize', this._onResize);
    this._stopResize();
    cancelAnimationFrame(this._frame);
    cancelAnimationFrame(this._widthFrame);
    super.dispose();
  }

  _setData(config) {
    const columns = parseJsonSource(config.columns);
    const rows = parseJsonSource(config.rows);
    this._columns = Array.isArray(columns) ? columns : null;
    this._rows = Array.isArray(rows) ? rows : null;
    this._columnCount = this._columns?.length ?? finiteNumber(config.columnCount, 0);
    this._rowCount = this._rows?.length ?? finiteNumber(config.rowCount, 0);
    if (!this._columnCount && Array.isArray(this._rows?.[0])) this._columnCount = this._rows[0].length;
    this._getRow = typeof config.getRow === 'function' ? config.getRow : (index) => this._rows?.[index];
    this._getCell =
      typeof config.getCell === 'function'
        ? config.getCell
        : (rowIndex, columnIndex, row, column) => {
            if (Array.isArray(row)) return row[columnIndex];
            if (row && typeof row === 'object') return row[columnKey(column, columnIndex)];
            return '';
          };
    this._getColumnLabel =
      typeof config.getColumnLabel === 'function'
        ? config.getColumnLabel
        : (index, column) => columnLabel(column, index);

    this._defaultColumnWidth = Math.max(1, finiteNumber(config.defaultColumnWidth, 192));
    this._minColumnWidth = Math.max(24, finiteNumber(config.minColumnWidth, 72));
    this._maxAutoWidth = Math.max(this._minColumnWidth, finiteNumber(config.maxAutoWidth, 512));
    this._autoSizeSample = Math.max(1, finiteNumber(config.autoSizeSample, 48));
    this._rowHeight = Math.max(20, finiteNumber(config.rowHeight, 40));
    this._headerHeight = Math.max(24, finiteNumber(config.headerHeight, 44));
    this._gutterWidth = Math.max(28, finiteNumber(config.gutterWidth, 56));
    this._overscan = Math.max(0, finiteNumber(config.overscan, 2));
    this._selectable = config.selectable !== false;

    this._columnWidths = new Float64Array(this._columnCount);
    this._columnOffsets = new Float64Array(this._columnCount + 1);
    for (let i = 0; i < this._columnCount; i += 1) {
      const width = this._columns?.[i]?.width;
      this._columnWidths[i] = Math.max(this._minColumnWidth, Number(width) || this._defaultColumnWidth);
    }
    this._rebuildOffsets(0);
    this._syncGeometry();
    this._selectedAll = false;
    this._element.classList.remove('is-table-selected');
    this._corner.setAttribute('aria-pressed', 'false');
    this._scheduleRender(true);
  }

  _syncGeometry() {
    this._totalWidth = this._columnOffsets[this._columnCount];
    this._totalHeight = this._rowCount * this._rowHeight;
    this._canvas.style.inlineSize = `${this._gutterWidth + this._totalWidth}px`;
    this._canvas.style.blockSize = `${this._headerHeight + this._totalHeight}px`;
    this._element.style.setProperty('--ja-datatable-row-height', `${this._rowHeight}px`);
    this._element.style.setProperty('--ja-datatable-header-height', `${this._headerHeight}px`);
    this._element.style.setProperty('--ja-datatable-gutter-width', `${this._gutterWidth}px`);
    this._element.style.setProperty('--ja-datatable-max-auto-width', `${this._maxAutoWidth}px`);
    this._viewport.setAttribute('aria-rowcount', String(this._rowCount + 1));
    this._viewport.setAttribute('aria-colcount', String(this._columnCount + 1));
    this._corner.style.inlineSize = `${this._gutterWidth}px`;
    this._corner.style.blockSize = `${this._headerHeight}px`;
    this._corner.setAttribute('aria-pressed', this._selectedAll ? 'true' : 'false');
    this._headerLayer.style.insetInlineStart = `${this._gutterWidth}px`;
    this._headerLayer.style.blockSize = `${this._headerHeight}px`;
    this._gutterLayer.style.insetBlockStart = `${this._headerHeight}px`;
    this._gutterLayer.style.inlineSize = `${this._gutterWidth}px`;
  }

  _rebuildOffsets(from) {
    const start = Math.max(0, from);
    if (start === 0) this._columnOffsets[0] = 0;
    for (let i = Math.max(0, start); i < this._columnCount; i += 1) {
      this._columnOffsets[i + 1] = this._columnOffsets[i] + this._columnWidths[i];
    }
  }

  _scheduleRender(force = false) {
    this._needsFullRender ||= force;
    if (this._frame) return;
    this._frame = requestAnimationFrame(() => {
      this._frame = 0;
      this._render(this._needsFullRender);
      this._needsFullRender = false;
    });
  }

  _columnAt(offset) {
    let low = 0;
    let high = this._columnCount - 1;
    let found = this._columnCount;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (this._columnOffsets[mid + 1] > offset) {
        found = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    return found;
  }

  _render(force = false) {
    const viewportWidth = this._viewport.clientWidth || 0;
    const viewportHeight = this._viewport.clientHeight || 0;
    const scrollLeft = this._viewport.scrollLeft;
    const scrollTop = this._viewport.scrollTop;

    const colStart = Math.max(0, this._columnAt(Math.max(0, scrollLeft - this._gutterWidth)) - this._overscan);
    const colEnd = Math.min(
      this._columnCount,
      this._columnAt(Math.max(0, scrollLeft + viewportWidth - this._gutterWidth)) + 1 + this._overscan
    );
    const rowStart = Math.max(0, Math.floor(Math.max(0, scrollTop - this._headerHeight) / this._rowHeight) - this._overscan);
    const rowEnd = Math.min(
      this._rowCount,
      Math.ceil(Math.max(0, scrollTop + viewportHeight - this._headerHeight) / this._rowHeight) + this._overscan
    );

    const state = this._renderState;
    if (
      !force &&
      rowStart === state.rowStart &&
      rowEnd === state.rowEnd &&
      colStart === state.colStart &&
      colEnd === state.colEnd &&
      viewportWidth === state.width &&
      viewportHeight === state.height
    ) {
      return;
    }

    this._renderState = { rowStart, rowEnd, colStart, colEnd, width: viewportWidth, height: viewportHeight };
    this._paintHeaders(colStart, colEnd, scrollLeft);
    this._paintGutter(rowStart, rowEnd, scrollTop);
    this._paintCells(rowStart, rowEnd, colStart, colEnd);
  }

  _paintHeaders(colStart, colEnd, scrollLeft) {
    let used = 0;
    for (let col = colStart; col < colEnd; col += 1) {
      const element = this._headerElement(used++);
      const width = this._columnWidths[col];
      const x = this._columnOffsets[col] - scrollLeft;
      element.dataset.col = String(col);
      element.style.transform = `translate(${x}px, 0)`;
      element.style.inlineSize = `${width}px`;
      const label = this._getColumnLabel(col, this._columns?.[col]);
      if (element._label !== label) {
        element.refs.label.textContent = label;
        element._label = label;
      }
      element.classList.toggle('is-selected', this._selectedAll);
    }
    for (let i = used; i < this._headerPool.length; i += 1) this._headerPool[i].hidden = true;
  }

  _paintGutter(rowStart, rowEnd, scrollTop) {
    let used = 0;
    for (let row = rowStart; row < rowEnd; row += 1) {
      const element = this._gutterElement(used++);
      const y = row * this._rowHeight - scrollTop;
      element.dataset.row = String(row);
      element.style.transform = `translate(0, ${y}px)`;
      element.textContent = String(row + 1);
      element.classList.toggle('is-selected', this._selectedAll);
    }
    for (let i = used; i < this._gutterPool.length; i += 1) this._gutterPool[i].hidden = true;
  }

  _paintCells(rowStart, rowEnd, colStart, colEnd) {
    let used = 0;
    for (let rowIndex = rowStart; rowIndex < rowEnd; rowIndex += 1) {
      const row = this._getRow(rowIndex);
      const y = this._headerHeight + rowIndex * this._rowHeight;
      for (let colIndex = colStart; colIndex < colEnd; colIndex += 1) {
        const element = this._cellElement(used++);
        const x = this._gutterWidth + this._columnOffsets[colIndex];
        const width = this._columnWidths[colIndex];
        element.dataset.row = String(rowIndex);
        element.dataset.col = String(colIndex);
        element.style.transform = `translate(${x}px, ${y}px)`;
        element.style.inlineSize = `${width}px`;
        const value = this._cellText(rowIndex, colIndex, row, this._columns?.[colIndex]);
        if (element._value !== value) {
          element.textContent = value;
          element._value = value;
        }
        element.classList.toggle('is-selected', this._selectedAll);
      }
    }
    for (let i = used; i < this._cellPool.length; i += 1) this._cellPool[i].hidden = true;
  }

  _headerElement(slot) {
    let element = this._headerPool[slot];
    if (!element) {
      element = fromHTML(
        '<div class="datatable-header-cell" role="columnheader">' +
          '<span class="datatable-label"></span>' +
          '<span class="datatable-resize-handle" data-role="col-handle" aria-hidden="true"></span>' +
        '</div>'
      );
      element.refs = { label: element.querySelector('.datatable-label') };
      this._headerLayer.append(element);
      this._headerPool[slot] = element;
    }
    element.hidden = false;
    return element;
  }

  _gutterElement(slot) {
    let element = this._gutterPool[slot];
    if (!element) {
      element = fromHTML('<div class="datatable-gutter-cell" role="rowheader"></div>');
      this._gutterLayer.append(element);
      this._gutterPool[slot] = element;
    }
    element.hidden = false;
    return element;
  }

  _cellElement(slot) {
    let element = this._cellPool[slot];
    if (!element) {
      element = fromHTML('<div class="datatable-cell" role="gridcell"></div>');
      this._canvas.append(element);
      this._cellPool[slot] = element;
    }
    element.hidden = false;
    return element;
  }

  _cellText(rowIndex, columnIndex, row, column) {
    const value = this._getCell(rowIndex, columnIndex, row, column);
    if (value == null) return '';
    return typeof value === 'string' ? value : String(value);
  }

  _handleClick(event) {
    const corner = event.target.closest('.datatable-corner');
    if (!corner || !this._selectable) return;
    event.preventDefault();
    this.selectAll(!this._selectedAll);
  }

  _handleKeydown(event) {
    if (!this._selectable) return;
    if (!event.target.closest('.datatable-corner')) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.selectAll(!this._selectedAll);
  }

  _handleDoubleClick(event) {
    const handle = event.target.closest('.datatable-resize-handle');
    if (handle?.dataset.role === 'all-handle') {
      if (this._selectedAll) {
        event.preventDefault();
        this.autoSizeAll();
      }
      return;
    }
    if (handle?.dataset.role === 'col-handle') {
      const header = handle.closest('.datatable-header-cell');
      const index = Number(header?.dataset.col);
      if (Number.isInteger(index)) {
        event.preventDefault();
        this.autoSizeColumn(index);
      }
      return;
    }
    const header = event.target.closest('.datatable-header-cell');
    const index = Number(header?.dataset.col);
    if (Number.isInteger(index)) {
      event.preventDefault();
      this.autoSizeColumn(index);
    }
  }

  _handlePointerDown(event) {
    const handle = event.target.closest('.datatable-resize-handle[data-role="col-handle"]');
    if (!handle) return;
    const header = handle.closest('.datatable-header-cell');
    const index = Number(header?.dataset.col);
    if (!Number.isInteger(index)) return;
    event.preventDefault();
    this._resize = {
      column: index,
      startX: event.clientX,
      startWidth: this._columnWidths[index],
    };
    this._pendingWidth = this._columnWidths[index];
    this._element.classList.add('is-resizing');
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp, { once: true });
  }

  _handlePointerMove(event) {
    if (!this._resize) return;
    this._pendingWidth = this._resize.startWidth + (event.clientX - this._resize.startX);
    if (this._widthFrame) return;
    this._widthFrame = requestAnimationFrame(() => {
      this._widthFrame = 0;
      if (!this._resize) return;
      this.resizeColumn(this._resize.column, this._pendingWidth, { silent: true });
    });
  }

  _handlePointerUp() {
    if (!this._resize) return;
    cancelAnimationFrame(this._widthFrame);
    this._widthFrame = 0;
    const { column } = this._resize;
    this.resizeColumn(column, this._pendingWidth, { silent: true });
    const width = this._columnWidths[column];
    this._stopResize();
    this._emit('columnresized', { column, width });
  }

  _stopResize() {
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    this._resize = null;
    this._element.classList.remove('is-resizing');
  }

  _sampleRows() {
    if (this._rowCount <= 0) return [];
    const rows = new Set();
    const { rowStart, rowEnd } = this._renderState;
    for (let i = rowStart; i < rowEnd; i += 1) rows.add(i);
    if (rows.size >= this._autoSizeSample) return [...rows].slice(0, this._autoSizeSample);
    for (let i = 0; i < this._rowCount && rows.size < this._autoSizeSample; i += 1) rows.add(i);
    if (this._rowCount <= this._autoSizeSample) return [...rows];
    const last = this._rowCount - 1;
    for (let i = 0; rows.size < this._autoSizeSample; i += 1) {
      const ratio = this._autoSizeSample === 1 ? 0 : i / (this._autoSizeSample - 1);
      rows.add(Math.round(ratio * last));
    }
    return [...rows];
  }

  _measureColumn(index) {
    const column = this._columns?.[index];
    const limit = Math.min(this._maxAutoWidth, Number(column?.maxWidth) || this._maxAutoWidth);
    let width = this._measureText(this._measureHeader, this._getColumnLabel(index, column));
    const rows = this._sampleRows();
    for (let i = 0; i < rows.length; i += 1) {
      const rowIndex = rows[i];
      const row = this._getRow(rowIndex);
      width = Math.max(width, this._measureText(this._measureCell, this._cellText(rowIndex, index, row, column)));
      if (width >= limit) return limit;
    }
    return clamp(width, this._minColumnWidth, limit);
  }

  /**
   * Read the font and the cell chrome once per auto-size pass.
   *
   * Auto-sizing a thousand columns means measuring tens of thousands of
   * strings. Doing that by writing textContent and reading scrollWidth is a
   * forced synchronous layout per string, which is what makes Excel-style
   * "fit every column" feel broken. A canvas measures the same text with no
   * layout at all, so the pass is arithmetic once these are known.
   */
  _primeMetrics() {
    this._metrics = null;
    if (!this._element.isConnected) return;

    if (this._measureContext === undefined) {
      this._measureContext = document.createElement('canvas').getContext('2d') ?? null;
    }
    if (!this._measureContext) return;

    const read = (element) => {
      const styles = getComputedStyle(element);
      // The text sits in a span, so the cell's own padding and borders are
      // chrome the canvas knows nothing about.
      const chrome =
        parseFloat(styles.paddingInlineStart) +
        parseFloat(styles.paddingInlineEnd) +
        parseFloat(styles.borderInlineStartWidth) +
        parseFloat(styles.borderInlineEndWidth);
      return {
        font: styles.font || `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`,
        letterSpacing: styles.letterSpacing,
        chrome: Number.isFinite(chrome) ? chrome : 0,
      };
    };

    const header = read(this._measureHeader);
    const cell = read(this._measureCell);
    if (!header.font || !cell.font) return;
    this._metrics = new Map([
      [this._measureHeader, header],
      [this._measureCell, cell],
    ]);
  }

  _measureText(element, text) {
    const metrics = this._metrics?.get(element);
    if (metrics) {
      const context = this._measureContext;
      context.font = metrics.font;
      // Chromium honours this; elsewhere it is silently ignored, and the
      // fallback below is what a browser without it would have used anyway.
      if ('letterSpacing' in context) context.letterSpacing = metrics.letterSpacing;
      return Math.ceil(context.measureText(text).width + metrics.chrome);
    }
    element.firstElementChild.textContent = text;
    return Math.ceil(element.scrollWidth);
  }
}
