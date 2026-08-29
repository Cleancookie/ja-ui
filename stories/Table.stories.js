import { html, note, stack, uid } from './helpers.js';

/**
 * A `<table>` with no classes on it at all is the deliverable. There is no
 * `.table`, no `.table-striped` wrapper class and no `.table-responsive` — the
 * three opt-in classes here (`.striped`, `.compact`, `.bordered`) are token
 * remaps on the table itself, and `.numeric` goes on the cells.
 *
 * The rule this family will not break: `display: block | flex | grid |
 * contents` on **any** table part removes that part from the accessibility
 * tree. That is why there is deliberately no card-per-row "responsive table"
 * skin — every one of those tricks is built on re-`display`ing table parts, and
 * every one of them silently destroys the semantics that made you choose a
 * table in the first place. The responsive answer is a scroll region.
 */
export default {
  title: 'Elements/Table',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The signature detail is the solid-ink header slab, painted on `<thead>` so it ' +
          'survives colspans and multiple header rows. The frame is an `outline` rather than ' +
          'a `border`: in the collapsed border model a table border is painted as part of the ' +
          "table's contents, so `overflow: clip` — which is what rounds the corners — would " +
          'clip it clean off.',
      },
    },
  },
};

const ROWS = [
  ['INV-2041', 'Northwind Traders', 'Paid', '4,120.00'],
  ['INV-2042', 'Contoso Ltd', 'Pending', '980.50'],
  ['INV-2043', 'Fabrikam Inc', 'Overdue', '12,400.00'],
  ['INV-2044', 'Adventure Works', 'Paid', '2,315.75'],
];

const body = () =>
  ROWS.map(
    ([ref, client, status, total]) => html`
      <tr>
        <th scope="row">${ref}</th>
        <td>${client}</td>
        <td>${status}</td>
        <td class="numeric">£${total}</td>
      </tr>
    `
  ).join('');

const table = (classes = '') => html`
  <table${classes ? ` class="${classes}"` : ''}>
    <caption>
      Outstanding invoices
    </caption>
    <thead>
      <tr>
        <th scope="col">Reference</th>
        <th scope="col">Client</th>
        <th scope="col">Status</th>
        <th scope="col" class="numeric">Total</th>
      </tr>
    </thead>
    <tbody>
      ${body()}
    </tbody>
    <tfoot>
      <tr>
        <th scope="row" colspan="3">Total</th>
        <td class="numeric">£19,816.25</td>
      </tr>
    </tfoot>
  </table>
`;

export const Bare = {
  parameters: {
    docs: {
      description: {
        story:
          'No classes at all. `<caption>` is the table\'s heading and sits on top in the loud ' +
          'label style — it is not a footnote. `<th scope="row">` stays in the body\'s paper, ' +
          'bold rather than inked, and `<tfoot>` is sunken with a full-strength rule above it.',
      },
    },
  },
  render: () => table(),
};

export const Variants = {
  parameters: {
    docs: {
      description: {
        story:
          'Three opt-in classes, each a **single token remap** — `.striped` sets ' +
          '`--ja-table-stripe`, `.compact` sets the two padding tokens, `.bordered` switches ' +
          'on the vertical rule. They compose. `.numeric` goes on cells, not on a `<col>`: ' +
          'padding, colour, alignment and font on a `<col>` are silently ignored by every ' +
          'engine, and tabular figures are the whole point of the class.',
      },
    },
  },
  render: () =>
    stack([
      table('striped'),
      table('compact bordered'),
      table('striped compact bordered'),
    ]),
};

export const Sortable = {
  parameters: {
    docs: {
      description: {
        story:
          '`aria-sort` is ARIA **state**, so styling it is legitimate — it says what the ' +
          'table is doing, not what it looks like. Only ever one column at a time. The header ' +
          'stays a `<th>` containing a real `<button>` that the author wires up; the library ' +
          'draws the arrow as a pseudo-element on the cell, so the control\'s accessible name ' +
          'stays "Client" rather than "Client ▲". Click a header — this one really sorts.',
      },
    },
  },
  render: () => {
    const root = document.createElement('div');
    root.innerHTML = html`
      <table class="striped">
        <caption>
          Outstanding invoices — sortable
        </caption>
        <thead>
          <tr>
            <th scope="col" aria-sort="none"><button type="button" class="sm">Reference</button></th>
            <th scope="col" aria-sort="none"><button type="button" class="sm">Client</button></th>
            <th scope="col" aria-sort="none"><button type="button" class="sm">Status</button></th>
            <th scope="col" class="numeric" aria-sort="none"><button type="button" class="sm">Total</button></th>
          </tr>
        </thead>
        <tbody>
          ${body()}
        </tbody>
      </table>
    `;

    root.addEventListener('click', (event) => {
      const button = event.target.closest('thead button');
      if (!button) return;
      const cell = button.closest('th');
      const headers = [...root.querySelectorAll('thead th')];
      const index = headers.indexOf(cell);
      const ascending = cell.getAttribute('aria-sort') !== 'ascending';

      for (const header of headers) header.setAttribute('aria-sort', 'none');
      cell.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');

      const tbody = root.querySelector('tbody');
      const text = (tr) => tr.children[index].textContent.trim();
      [...tbody.rows]
        .sort((a, b) => (ascending ? 1 : -1) * text(a).localeCompare(text(b), 'en', { numeric: true }))
        .forEach((tr) => tbody.append(tr));
    });

    return root;
  },
};

export const Selectable = {
  name: 'A control in a cell',
  parameters: {
    docs: {
      description: {
        story:
          'A cell holding a control backs off its block padding rather than stacking two lots ' +
          'of air, and a checkbox column shrinks to fit with the `inline-size: 1%` ' +
          'table-layout idiom. Each row checkbox needs its own accessible name — a column of ' +
          'boxes all announced as "checkbox" is a column of unusable boxes.',
      },
    },
  },
  render: () => html`
    <table class="compact">
      <caption>
        Select invoices to export
      </caption>
      <thead>
        <tr>
          <th scope="col"><input type="checkbox" aria-label="Select all invoices" /></th>
          <th scope="col">Reference</th>
          <th scope="col">Client</th>
          <th scope="col" class="numeric">Total</th>
        </tr>
      </thead>
      <tbody>
        ${ROWS.map(
          ([ref, client, , total]) => html`
            <tr>
              <td><input type="checkbox" aria-label="Select ${ref}" /></td>
              <th scope="row">${ref}</th>
              <td>${client}</td>
              <td class="numeric">£${total}</td>
            </tr>
          `
        ).join('')}
      </tbody>
    </table>
  `,
};

export const ScrollRegion = {
  name: 'The scroll region',
  parameters: {
    docs: {
      description: {
        story:
          'The responsive answer, and it is markup the author writes: a `role="region"` with ' +
          '**`tabindex="0"`** and an accessible name. The tabindex is not decorative — a ' +
          'scrollable box that cannot be focused cannot be scrolled from the keyboard, which ' +
          'is a WCAG 2.1.1 failure, and browsers will not add the tabstop for you. The ' +
          'wrapper also takes the shadow over, because an offset shadow drawn inside a scroll ' +
          'container is clipped along the two edges it is offset toward.',
      },
    },
  },
  render: () => {
    const captionId = uid('ledger-caption');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return html`
      <div style="display:flex;flex-direction:column;gap:var(--ja-space-4)">
        <div role="region" aria-labelledby="${captionId}" tabindex="0">
          <table class="striped compact">
            <caption id="${captionId}">
              Revenue by month — scrolls sideways
            </caption>
            <thead>
              <tr>
                <th scope="col">Region</th>
                ${months.map((m) => `<th scope="col" class="numeric">${m}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${['North', 'South', 'Wales']
                .map(
                  (region, r) => html`
                    <tr>
                      <th scope="row">${region}</th>
                      ${months
                        .map((_, i) => `<td class="numeric">£${((i + 2) * (r + 3) * 137).toLocaleString()}</td>`)
                        .join('')}
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>
        </div>
        ${note(
          'For a grid with a million rows, a resizable column and both axes virtualised, see ' +
            '<strong>Components → DataTable</strong>. That is the one place in the library ' +
            'where a table is not a <code>&lt;table&gt;</code>, and it is a deliberate, ' +
            'documented trade.'
        )}
      </div>
    `;
  },
};
