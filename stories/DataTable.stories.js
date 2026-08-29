import { DataTable } from '../src/index.js';
import { html, note, stack, uid } from './helpers.js';

/**
 * The second of the two non-native components, and the one place in the library
 * where a table is deliberately **not** a `<table>`.
 *
 * That is a documented trade, not an oversight. Every part of a `<table>` loses
 * its accessibility semantics the moment CSS re-`display`s it, and a virtualised
 * grid has to control its own layout absolutely — so for anything that fits in
 * the DOM, use a real `<table>` (see Elements → Table, including the scroll
 * region). Reach for this only when the data genuinely does not fit.
 */
export default {
  title: 'Components/DataTable',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A spreadsheet-ish grid for serious data: both axes are virtualised, columns start at a fixed width, ' +
          'drag the edge to resize, double-click a header edge to auto-size that column, and double-click the ' +
          'top-left gutter edge after selecting the sheet to auto-size every column. ' +
          'It is driven by `[data-ja-datatable]`, the only data attribute in the class inventory apart from ' +
          'the theme hooks.',
      },
    },
  },
};

const INVOICES = [
  ['INV-2041', 'Northwind Traders', 'Paid', '£4,120.00', '2026-08-19'],
  ['INV-2042', 'Contoso Ltd', 'Pending', '£980.50', '2026-08-21'],
  ['INV-2043', 'Fabrikam Inc', 'Overdue', '£12,400.00', '2026-08-22'],
  ['INV-2044', 'Adventure Works', 'Paid', '£2,315.75', '2026-08-23'],
  ['INV-2045', 'Graphic Design Institute', 'Pending', '£184.00', '{"kind":"note","owner":"sales","tags":["priority","west"]}'],
];

function mount({ config, caption }) {
  const id = uid('datatable');
  const root = document.createElement('div');
  root.innerHTML = stack([caption ? note(caption) : '', html`<div id="${id}"></div>`]);
  requestAnimationFrame(() => new DataTable(root.querySelector(`#${id}`), config));
  return root;
}

export const InvoiceGrid = {
  render: () =>
    mount({
      caption: 'Double-click a header edge to fit the contents, but long strings still clamp at the configured max.',
      config: {
        columns: ['Reference', 'Client', 'Status', 'Total', 'Notes'],
        rows: INVOICES,
        maxAutoWidth: 320,
      },
    }),
};

export const MillionByThousand = {
  name: '1,000,000 × 1,000',
  parameters: {
    docs: {
      description: {
        story:
          'The data itself is generated on demand. Scroll hard in either direction: only the visible window is in the DOM.',
      },
    },
  },
  render: () =>
    mount({
      config: {
        columnCount: 1000,
        rowCount: 1000000,
        defaultColumnWidth: 160,
        maxAutoWidth: 280,
        getColumnLabel: (index) => `Field ${index + 1}`,
        getCell: (rowIndex, columnIndex) =>
          columnIndex === 7 && rowIndex === 17
            ? '{"type":"audit","payload":"this very long blob should stop at the autosize cap"}'
            : `R${rowIndex + 1} · C${columnIndex + 1}`,
      },
    }),
};

export const JsonSources = {
  name: 'JSON sources',
  render: () => {
    const id = uid('datatable-json');
    const root = document.createElement('div');
    root.innerHTML = html`
      <script type="application/json" id="${id}-columns">
        ["SKU","Name","Warehouse","Stock"]
      </script>
      <script type="application/json" id="${id}-rows">
        [["A-100","Travel mug","Manchester",24],["B-240","Desk lamp","Leeds",8],["C-880","Notebook pack","Bristol",190]]
      </script>
      <div
        id="${id}"
        data-ja-datatable
        data-ja-columns="#${id}-columns"
        data-ja-rows="#${id}-rows"
      ></div>
    `;
    requestAnimationFrame(() => DataTable.getOrCreateInstance(root.querySelector(`#${id}`)));
    return root;
  },
};
