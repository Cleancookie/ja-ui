import { Component } from './base.js';
import { fuzzyMatch, parseQuery } from './fuzzy.js';
import {
  fromHTML,
  lockScroll,
  onTransitionEnd,
  prefersReducedMotion,
  reflow,
  trapFocus,
  unlockScroll,
} from './dom.js';

let paletteSeq = 0;

const ESCAPE_HTML = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (c) => ESCAPE_HTML[c]);

const isMac = () =>
  typeof navigator !== 'undefined' &&
  /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent || '');

/** Turn "mod+k" into something a keydown can be tested against. */
function parseHotkey(spec) {
  if (!spec || typeof spec !== 'string') return null;
  const parts = spec.toLowerCase().split('+').map((part) => part.trim()).filter(Boolean);
  const key = parts.pop();
  if (!key) return null;
  const combo = { key, ctrl: false, meta: false, alt: false, shift: false };
  for (const part of parts) {
    if (part === 'mod') combo[isMac() ? 'meta' : 'ctrl'] = true;
    else if (part === 'ctrl' || part === 'control') combo.ctrl = true;
    else if (part === 'cmd' || part === 'meta' || part === 'super' || part === 'win') combo.meta = true;
    else if (part === 'alt' || part === 'option') combo.alt = true;
    else if (part === 'shift') combo.shift = true;
  }
  return combo;
}

const matchesHotkey = (event, combo) =>
  combo &&
  event.ctrlKey === combo.ctrl &&
  event.metaKey === combo.meta &&
  event.altKey === combo.alt &&
  event.shiftKey === combo.shift &&
  event.key.toLowerCase() === combo.key;

const SEARCH_ICON =
  '<svg class="command-palette-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="2.5" stroke-linecap="round" aria-hidden="true">' +
  '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

const TEMPLATE = `
<div class="command-palette-backdrop"></div>
<div class="command-palette-dialog" role="dialog" aria-modal="true">
  <div class="command-palette-search">
    ${SEARCH_ICON}
    <input class="command-palette-input" type="text" role="combobox" autocomplete="off"
           autocorrect="off" autocapitalize="off" spellcheck="false" aria-autocomplete="list" aria-expanded="true" />
    <kbd class="command-palette-esc">esc</kbd>
  </div>
  <div class="command-palette-list" role="listbox" tabindex="-1">
    <div class="command-palette-canvas">
      <div class="command-palette-highlight" aria-hidden="true"></div>
    </div>
    <p class="command-palette-empty" hidden></p>
  </div>
  <div class="command-palette-footer">
    <span class="command-palette-count" aria-live="polite"></span>
    <span class="command-palette-legend">
      <kbd>↑</kbd><kbd>↓</kbd> move <kbd>↵</kbd> run <kbd>esc</kbd> close
    </span>
  </div>
</div>`;

/**
 * CommandPalette — a ctrl-P for your app.
 *
 * fzf's feel, in a browser: type a few letters of anything, the list narrows
 * and re-ranks, and Enter runs the top hit. Arrow keys or ctrl-J / ctrl-K move
 * the selection, and a single highlight block slides between rows rather than
 * blinking from one to the next.
 *
 * It is built for lists that are too big to put in a <select>: rows are
 * virtualised (only the visible window is ever in the DOM, recycled as you
 * scroll) and each keystroke re-filters inside the previous result set, so
 * typing stays interactive at a hundred thousand items.
 *
 * Two deliberate details:
 *   - A pointer that already sits over the list when the palette opens does
 *     not steal the selection. Hover only takes over once the mouse has
 *     actually moved, so a palette opened under the cursor still runs the
 *     item you were aiming at with the keyboard.
 *   - Keyboard navigation scrolls instantly while the highlight animates. A
 *     smooth-scrolling container fighting an animating highlight is what makes
 *     most palettes feel soupy when you hold the arrow key down.
 */
export class CommandPalette extends Component {
  static NAME = 'command-palette';
  static Default = {
    /** Array of items, or a function returning one — called on every open. */
    items: null,
    placeholder: 'Type a command…',
    emptyText: 'No matches',
    /** Global shortcut that opens it, e.g. "mod+k". Null wires up nothing. */
    hotkey: null,
    /** Dim the page behind, and close on an outside click. */
    backdrop: true,
    /** Close on Escape. */
    keyboard: true,
    /** Reset the query when it closes. */
    clearOnClose: true,
    /** Show group headers when the query is empty. */
    groups: true,
    /** Rows rendered above and below the visible window. */
    overscan: 4,
    /** Cap the number of results, 0 for no cap. */
    limit: 0,
    /** Keep it open after a selection. */
    keepOpen: false,
    /** Called with (item, event) when a row is chosen. */
    onSelect: null,
  };

  constructor(element, config) {
    super(element, config);

    this._id = this._element.id || `ja-palette-${(paletteSeq += 1)}`;
    this._element.classList.add('command-palette');
    this._element.setAttribute('aria-hidden', 'true');

    this._build();

    this._items = [];
    this._matches = [];
    this._rows = [];
    this._active = -1;
    this._query = '';
    this._lastQuery = null;
    this._lastMatches = null;
    this._itemHeight = 44;
    this._headerHeight = 30;
    this._canvasOffset = 0;
    this._itemPool = [];
    this._headerPool = [];
    this._window = { start: -1, end: -1 };
    this._frame = 0;
    this._releaseFocus = null;

    // Pointer state — see the note in the class comment.
    this._pointerArmed = false;
    this._pointerAt = null;

    this._hotkey = parseHotkey(this._config.hotkey);
    this._onDocumentKeydown = this._handleDocumentKeydown.bind(this);
    this._onKeydown = this._handleKeydown.bind(this);
    this._onInput = this._handleInput.bind(this);
    this._onScroll = () => this._scheduleRender();
    this._onResize = () => this._scheduleRender();
    this._onPointerMove = this._handlePointerMove.bind(this);
    this._onClick = this._handleClick.bind(this);

    this._element.addEventListener('keydown', this._onKeydown);
    this._element.addEventListener('click', this._onClick);
    this._input.addEventListener('input', this._onInput);
    this._list.addEventListener('scroll', this._onScroll, { passive: true });
    this._list.addEventListener('pointermove', this._onPointerMove);

    if (this._hotkey) document.addEventListener('keydown', this._onDocumentKeydown);
    if (Array.isArray(this._config.items)) this.setItems(this._config.items);
    else if (typeof this._config.items === 'string') this.setItems(this._readItemsFromDOM(this._config.items));
  }

  /* --- Structure ---------------------------------------------------------- */

  _build() {
    this._element.innerHTML = TEMPLATE;

    this._backdrop = this._element.querySelector('.command-palette-backdrop');
    this._dialog = this._element.querySelector('.command-palette-dialog');
    this._input = this._element.querySelector('.command-palette-input');
    this._list = this._element.querySelector('.command-palette-list');
    this._canvas = this._element.querySelector('.command-palette-canvas');
    this._highlight = this._element.querySelector('.command-palette-highlight');
    this._empty = this._element.querySelector('.command-palette-empty');
    this._count = this._element.querySelector('.command-palette-count');

    this._list.id = `${this._id}-list`;
    this._input.id = `${this._id}-input`;
    this._input.placeholder = this._config.placeholder;
    this._input.setAttribute('aria-controls', this._list.id);
    this._empty.textContent = this._config.emptyText;
    if (!this._config.backdrop) this._backdrop.remove();
  }

  /** `data-ja-items="#some-json-script"` — items straight out of the page. */
  _readItemsFromDOM(selector) {
    const source = document.querySelector(selector);
    if (!source) return [];
    try {
      return JSON.parse(source.textContent);
    } catch {
      return [];
    }
  }

  /* --- Items -------------------------------------------------------------- */

  /**
   * Replace the item list. Strings are fine; objects take
   * `{ id, label, description, hint, group, icon, keywords, disabled, onSelect }`.
   * The lowercase haystack is built once here, not per keystroke.
   */
  setItems(items) {
    const source = Array.isArray(items) ? items : [];
    this._items = new Array(source.length);
    this._hasGroups = false;

    for (let i = 0; i < source.length; i += 1) {
      const raw = source[i];
      const item = typeof raw === 'string' ? { label: raw } : { ...raw };
      const label = String(item.label ?? item.title ?? item.name ?? '');
      const extra = [item.keywords, item.description, item.group]
        .flat()
        .filter(Boolean)
        .join(' ');
      item.label = label;
      item._text = extra ? `${label} ${extra}` : label;
      item._lower = item._text.toLowerCase();
      item._labelLength = label.length;
      if (item.group) this._hasGroups = true;
      this._items[i] = item;
    }

    this._lastQuery = null;
    this._lastMatches = null;
    if (this.isShown) this._refilter({ resetScroll: true });
    return this;
  }

  get items() {
    return this._items;
  }

  /** The item currently under the highlight, or null. */
  get activeItem() {
    const row = this._rows[this._active];
    return row && row.type === 'item' ? row.item : null;
  }

  get isShown() {
    return this._element.classList.contains('show');
  }

  /* --- Show / hide -------------------------------------------------------- */

  toggle(relatedTarget) {
    return this.isShown ? this.hide() : this.show(relatedTarget);
  }

  show(relatedTarget = null) {
    if (this.isShown) return;
    if (typeof this._config.items === 'function') this.setItems(this._config.items());
    if (!this._emit('show', { relatedTarget }, true)) return;

    lockScroll();
    const element = this._element;
    element.removeAttribute('aria-hidden');
    reflow(element);
    element.classList.add('show');

    // A pointer resting over the list must not claim the selection.
    this._pointerArmed = false;
    this._pointerAt = null;

    this._measure();
    this._input.value = this._query;
    this._refilter({ resetScroll: true });

    // Trap before focusing, so the trap remembers the trigger and not the input.
    this._releaseFocus = trapFocus(element);
    this._input.focus();
    this._input.select();

    window.addEventListener('resize', this._onResize);
    document.addEventListener('keydown', this._onDocumentKeydown);

    onTransitionEnd(this._dialog, () => {
      if (this.isShown) this._emit('shown', { relatedTarget });
    });
  }

  hide() {
    if (!this.isShown) return;
    if (!this._emit('hide', {}, true)) return;

    this._element.classList.remove('show');
    unlockScroll();
    window.removeEventListener('resize', this._onResize);
    if (!this._hotkey) document.removeEventListener('keydown', this._onDocumentKeydown);
    this._releaseFocus?.();
    this._releaseFocus = null;

    if (this._config.clearOnClose) {
      this._query = '';
      this._input.value = '';
      this._lastQuery = null;
      this._lastMatches = null;
    }

    onTransitionEnd(this._dialog, () => {
      if (this.isShown) return; // re-opened before the animation finished
      this._element.setAttribute('aria-hidden', 'true');
      this._emit('hidden');
    });
  }

  /* --- Filtering ---------------------------------------------------------- */

  _handleInput() {
    this._query = this._input.value;
    this._refilter({ resetScroll: true });
  }

  /**
   * Re-rank against the current query.
   *
   * When the query only grew, the previous result set is a superset of the new
   * one, so only those candidates are re-scored. That is the difference
   * between a palette that keeps up with your typing on a huge list and one
   * that does not.
   */
  _refilter({ resetScroll = false } = {}) {
    const query = this._query.trim();
    const terms = parseQuery(query);
    const items = this._items;

    let matches;
    if (!terms.length) {
      matches = new Array(items.length);
      for (let i = 0; i < items.length; i += 1) matches[i] = { index: i, score: 0, positions: null };
    } else {
      const narrowing =
        this._lastMatches && this._lastQuery && query.startsWith(this._lastQuery) && this._lastQuery.length;
      const pool = narrowing ? this._lastMatches : null;
      const total = pool ? pool.length : items.length;
      matches = [];
      for (let i = 0; i < total; i += 1) {
        const index = pool ? pool[i].index : i;
        const item = items[index];
        const match = fuzzyMatch(item._text, terms, {
          lowerText: item._lower,
          primaryLength: item._labelLength,
        });
        if (match) matches.push({ index, score: match.score, positions: match.positions });
      }
      matches.sort(
        (a, b) =>
          b.score - a.score ||
          items[a.index]._labelLength - items[b.index]._labelLength ||
          a.index - b.index
      );
    }

    this._lastQuery = query;
    this._lastMatches = matches;
    this._matches = this._config.limit > 0 ? matches.slice(0, this._config.limit) : matches;

    this._layout();
    if (resetScroll) this._list.scrollTop = 0;
    this._render(true);
    this._setActive(this._firstSelectable(), { animate: false });
    this._updateCount(matches.length);
    this._emit('filter', { query, count: matches.length });
  }

  /** Flatten matches (plus group headers) into rows with absolute offsets. */
  _layout() {
    const rows = [];
    const grouped = this._config.groups && this._hasGroups && !this._query.trim();
    let top = 0;
    let group = null;

    for (let i = 0; i < this._matches.length; i += 1) {
      const match = this._matches[i];
      const item = this._items[match.index];
      if (grouped && item.group && item.group !== group) {
        group = item.group;
        rows.push({ type: 'header', label: group, top, height: this._headerHeight });
        top += this._headerHeight;
      }
      rows.push({ type: 'item', item, match, top, height: this._itemHeight });
      top += this._itemHeight;
    }

    this._rows = rows;
    this._canvas.style.blockSize = `${top}px`;
    this._empty.hidden = rows.length > 0;
    this._list.classList.toggle('is-empty', rows.length === 0);
    this._window = { start: -1, end: -1 };
  }

  _updateCount(total) {
    if (!this._count) return;
    const shown = this._matches.length;
    const all = this._items.length;
    this._count.textContent = total === all ? `${all}` : `${shown} of ${all}`;
  }

  /* --- Virtual rendering -------------------------------------------------- */

  /** Item and header heights come from CSS, so a re-skin stays in CSS. */
  _measure() {
    const styles = getComputedStyle(this._list);
    const item = parseFloat(styles.getPropertyValue('--ja-command-palette-item-height'));
    const header = parseFloat(styles.getPropertyValue('--ja-command-palette-header-height'));
    if (item > 0) this._itemHeight = item;
    if (header > 0) this._headerHeight = header;
    // The list is padded, so row offsets and scrollTop differ by that padding.
    this._canvasOffset = this._canvas.offsetTop;
  }

  _scheduleRender() {
    if (this._frame) return;
    this._frame = requestAnimationFrame(() => {
      this._frame = 0;
      this._render();
    });
  }

  /** First row whose bottom edge is past `offset`. */
  _rowAt(offset) {
    const rows = this._rows;
    let low = 0;
    let high = rows.length - 1;
    let found = rows.length;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (rows[mid].top + rows[mid].height > offset) {
        found = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    return found;
  }

  _render(force = false) {
    const rows = this._rows;
    const scrollTop = this._list.scrollTop - this._canvasOffset;
    const viewport = this._list.clientHeight || 0;
    const overscan = this._config.overscan;

    const start = Math.max(0, this._rowAt(scrollTop) - overscan);
    const end = Math.min(rows.length, this._rowAt(scrollTop + viewport) + 1 + overscan);
    if (!force && start === this._window.start && end === this._window.end) return;
    this._window = { start, end };

    let items = 0;
    let headers = 0;
    for (let i = start; i < end; i += 1) {
      const row = rows[i];
      if (row.type === 'header') this._paintHeader(this._headerElement(headers++), row);
      else this._paintItem(this._itemElement(items++), row, i);
    }
    for (let i = items; i < this._itemPool.length; i += 1) this._itemPool[i].hidden = true;
    for (let i = headers; i < this._headerPool.length; i += 1) this._headerPool[i].hidden = true;
  }

  _itemElement(slot) {
    let element = this._itemPool[slot];
    if (!element) {
      element = fromHTML(
        '<div class="command-palette-item" role="option">' +
          '<span class="command-palette-item-icon" aria-hidden="true"></span>' +
          '<span class="command-palette-item-text">' +
          '<span class="command-palette-item-label"></span>' +
          '<span class="command-palette-item-description"></span>' +
          '</span>' +
          '<span class="command-palette-item-meta"></span>' +
          '</div>'
      );
      element.refs = {
        icon: element.querySelector('.command-palette-item-icon'),
        label: element.querySelector('.command-palette-item-label'),
        description: element.querySelector('.command-palette-item-description'),
        meta: element.querySelector('.command-palette-item-meta'),
      };
      this._canvas.append(element);
      this._itemPool[slot] = element;
    }
    element.hidden = false;
    return element;
  }

  _headerElement(slot) {
    let element = this._headerPool[slot];
    if (!element) {
      element = fromHTML('<div class="command-palette-header" role="presentation"></div>');
      this._canvas.append(element);
      this._headerPool[slot] = element;
    }
    element.hidden = false;
    return element;
  }

  _paintHeader(element, row) {
    element.style.translate = `0 ${row.top}px`;
    if (element.textContent !== row.label) element.textContent = row.label;
  }

  _paintItem(element, row, rowIndex) {
    const { item, match } = row;
    const refs = element.refs;

    element.style.translate = `0 ${row.top}px`;
    element.id = `${this._id}-opt-${rowIndex}`;
    element.dataset.row = String(rowIndex);
    element.classList.toggle('is-active', rowIndex === this._active);
    element.classList.toggle('is-disabled', Boolean(item.disabled));
    element.setAttribute('aria-selected', rowIndex === this._active ? 'true' : 'false');
    if (item.disabled) element.setAttribute('aria-disabled', 'true');
    else element.removeAttribute('aria-disabled');

    const labelHtml = highlightLabel(item.label, match.positions);
    if (element._labelHtml !== labelHtml) {
      refs.label.innerHTML = labelHtml;
      element._labelHtml = labelHtml;
    }

    const description = item.description ?? '';
    if (refs.description.textContent !== description) refs.description.textContent = description;
    refs.description.hidden = !description;

    const icon = item.icon ?? '';
    if (element._iconHtml !== icon) {
      refs.icon.innerHTML = icon;
      element._iconHtml = icon;
    }
    refs.icon.hidden = !icon;

    const meta = item.hint ?? item.shortcut ?? (this._query.trim() ? item.group ?? '' : '');
    if (refs.meta.textContent !== meta) refs.meta.textContent = meta;
    refs.meta.hidden = !meta;
  }

  /* --- Selection ---------------------------------------------------------- */

  _isSelectable(row) {
    return row && row.type === 'item' && !row.item.disabled;
  }

  _firstSelectable() {
    for (let i = 0; i < this._rows.length; i += 1) if (this._isSelectable(this._rows[i])) return i;
    return -1;
  }

  /**
   * Move the highlight. The block slides between rows; the list itself jumps,
   * because a smooth scroll racing an animating highlight is what makes a
   * held-down arrow key feel like mud.
   */
  _setActive(rowIndex, { animate = true, scroll = true } = {}) {
    const previous = this._active;
    this._active = rowIndex;

    if (previous !== rowIndex && previous >= 0) {
      const stale = this._canvas.querySelector(`[data-row="${previous}"]`);
      if (stale) {
        stale.classList.remove('is-active');
        stale.setAttribute('aria-selected', 'false');
      }
    }

    const row = this._rows[rowIndex];
    if (!row) {
      this._highlight.classList.add('is-hidden');
      this._input.removeAttribute('aria-activedescendant');
      return;
    }

    if (scroll) this._scrollRowIntoView(rowIndex);

    const jump = !animate || prefersReducedMotion();
    if (jump) this._highlight.classList.add('is-instant');
    this._highlight.classList.remove('is-hidden');
    this._highlight.style.blockSize = `${row.height}px`;
    this._highlight.style.translate = `0 ${row.top}px`;
    if (jump) {
      reflow(this._highlight);
      this._highlight.classList.remove('is-instant');
    }

    this._input.setAttribute('aria-activedescendant', `${this._id}-opt-${rowIndex}`);
    this._render();

    const current = this._canvas.querySelector(`[data-row="${rowIndex}"]`);
    if (current) {
      current.classList.add('is-active');
      current.setAttribute('aria-selected', 'true');
    }
    if (previous !== rowIndex) this._emit('highlight', { item: this.activeItem, index: rowIndex });
  }

  _scrollRowIntoView(rowIndex) {
    const row = this._rows[rowIndex];
    if (!row) return;
    // Pull a preceding group header into view with its first item.
    const lead = this._rows[rowIndex - 1];
    const top = (lead && lead.type === 'header' ? lead.top : row.top) + this._canvasOffset;
    const bottom = row.top + row.height + this._canvasOffset;
    const list = this._list;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  }

  /** Step `delta` selectable rows, wrapping at both ends like fzf. */
  _move(delta) {
    const rows = this._rows;
    if (!rows.length) return;
    let index = this._active;
    for (let step = 0; step < rows.length; step += 1) {
      index += delta;
      if (index < 0) index = rows.length - 1;
      else if (index >= rows.length) index = 0;
      if (this._isSelectable(rows[index])) {
        this._setActive(index);
        return;
      }
    }
  }

  _movePage(direction) {
    const perPage = Math.max(1, Math.floor(this._list.clientHeight / this._itemHeight) - 1);
    const target = Math.min(
      this._rows.length - 1,
      Math.max(0, this._active + direction * perPage)
    );
    let index = target;
    while (index >= 0 && index < this._rows.length && !this._isSelectable(this._rows[index])) {
      index += direction;
    }
    if (this._isSelectable(this._rows[index])) this._setActive(index);
    else this._move(direction);
  }

  _moveEdge(direction) {
    const rows = this._rows;
    const range = direction > 0 ? [rows.length - 1, -1, -1] : [0, rows.length, 1];
    for (let i = range[0]; i !== range[1]; i += range[2]) {
      if (this._isSelectable(rows[i])) {
        this._setActive(i);
        return;
      }
    }
  }

  /** Run the highlighted row. */
  select(event = null) {
    const row = this._rows[this._active];
    if (!this._isSelectable(row)) return false;
    const item = row.item;
    if (!this._emit('select', { item, index: row.match.index, query: this._query }, true)) return false;
    item.onSelect?.(item, event);
    this._config.onSelect?.(item, event);
    if (!this._config.keepOpen) this.hide();
    return true;
  }

  /* --- Events ------------------------------------------------------------- */

  _handleDocumentKeydown(event) {
    // While the palette has focus its own bindings win, so a hotkey like
    // "mod+k" can coexist with ctrl-K for "move up".
    const inside = this.isShown && this._element.contains(event.target);
    if (!inside && this._hotkey && matchesHotkey(event, this._hotkey)) {
      event.preventDefault();
      this.toggle();
      return;
    }
    if (!this.isShown || !this._config.keyboard) return;
    if (event.key === 'Escape' && !this._element.contains(event.target)) {
      event.preventDefault();
      this.hide();
    }
  }

  _handleKeydown(event) {
    const ctrl = event.ctrlKey && !event.metaKey && !event.altKey;
    const key = event.key;

    if (key === 'Escape') {
      if (!this._config.keyboard) return;
      event.preventDefault();
      this.hide();
      return;
    }
    if (key === 'Enter') {
      event.preventDefault();
      this.select(event);
      return;
    }

    let delta = 0;
    if (key === 'ArrowDown' || (ctrl && (key === 'j' || key === 'n'))) delta = 1;
    else if (key === 'ArrowUp' || (ctrl && (key === 'k' || key === 'p'))) delta = -1;

    if (delta) {
      event.preventDefault();
      this._disarmPointer();
      this._move(delta);
      return;
    }

    if (key === 'PageDown' || (ctrl && key === 'd')) {
      event.preventDefault();
      this._disarmPointer();
      this._movePage(1);
    } else if (key === 'PageUp' || (ctrl && key === 'u')) {
      event.preventDefault();
      this._disarmPointer();
      this._movePage(-1);
    } else if (key === 'Home') {
      event.preventDefault();
      this._disarmPointer();
      this._moveEdge(-1);
    } else if (key === 'End') {
      event.preventDefault();
      this._disarmPointer();
      this._moveEdge(1);
    }
  }

  _disarmPointer() {
    this._pointerArmed = false;
    this._pointerAt = null;
  }

  /**
   * Hover only takes the selection once the pointer has genuinely moved.
   * The first event after opening (or after a keystroke scrolled the list
   * under a resting cursor) is recorded and ignored.
   */
  _handlePointerMove(event) {
    const previous = this._pointerAt;
    this._pointerAt = { x: event.clientX, y: event.clientY };
    if (!this._pointerArmed) {
      if (!previous) return;
      if (Math.abs(event.clientX - previous.x) < 2 && Math.abs(event.clientY - previous.y) < 2) return;
      this._pointerArmed = true;
    }

    const element = event.target.closest?.('.command-palette-item');
    if (!element || element.classList.contains('is-disabled')) return;
    const rowIndex = Number(element.dataset.row);
    if (rowIndex !== this._active) this._setActive(rowIndex, { scroll: false });
  }

  _handleClick(event) {
    const element = event.target.closest?.('.command-palette-item');
    if (element) {
      if (element.classList.contains('is-disabled')) return;
      const rowIndex = Number(element.dataset.row);
      if (rowIndex !== this._active) this._setActive(rowIndex, { animate: false, scroll: false });
      this.select(event);
      return;
    }
    // Anything outside the dialog is the backdrop.
    if (this._config.backdrop && !this._dialog.contains(event.target)) this.hide();
  }

  dispose() {
    if (this._frame) cancelAnimationFrame(this._frame);
    window.removeEventListener('resize', this._onResize);
    document.removeEventListener('keydown', this._onDocumentKeydown);
    this._element.removeEventListener('keydown', this._onKeydown);
    this._element.removeEventListener('click', this._onClick);
    this._releaseFocus?.({ restoreFocus: false });
    if (this.isShown) unlockScroll();
    super.dispose();
  }
}

/** Wrap the matched characters of `label` in <mark>. */
function highlightLabel(label, positions) {
  if (!positions || !positions.length) return escapeHtml(label);
  let html = '';
  let cursor = 0;
  for (let i = 0; i < positions.length; ) {
    const start = positions[i];
    let end = start + 1;
    while (i + 1 < positions.length && positions[i + 1] === end) {
      end += 1;
      i += 1;
    }
    i += 1;
    html += escapeHtml(label.slice(cursor, start));
    html += `<mark>${escapeHtml(label.slice(start, end))}</mark>`;
    cursor = end;
  }
  return html + escapeHtml(label.slice(cursor));
}
