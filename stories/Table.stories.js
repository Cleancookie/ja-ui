import { html } from './helpers.js';

export default {
  title: 'Components/Table',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Table headers are a solid block of ink. Wrap a table in `.table-card` for the ' +
          'full bordered, rounded, shadowed panel.',
      },
    },
  },
};

const ROWS = [
  ['INV-2041', 'Northwind Traders', 'Paid', '£4,120.00'],
  ['INV-2042', 'Contoso Ltd', 'Pending', '£980.50'],
  ['INV-2043', 'Fabrikam Inc', 'Overdue', '£12,400.00'],
  ['INV-2044', 'Adventure Works', 'Paid', '£2,315.75'],
];

const STATUS = { Paid: 'success', Pending: 'warning', Overdue: 'danger' };

const body = () =>
  ROWS.map(
    ([ref, client, status, total]) => html`
      <tr>
        <td><code>${ref}</code></td>
        <td>${client}</td>
        <td><span class="badge bg-${STATUS[status]}-subtle">${status}</span></td>
        <td class="text-end">${total}</td>
      </tr>
    `
  ).join('');

const table = (classes = '') => html`
  <table class="table ${classes}">
    <thead>
      <tr>
        <th>Reference</th>
        <th>Client</th>
        <th>Status</th>
        <th class="text-end">Total</th>
      </tr>
    </thead>
    <tbody>
      ${body()}
    </tbody>
  </table>
`;

export const Basic = { render: () => table() };
export const Striped = { render: () => table('table-striped') };
export const Hover = { render: () => table('table-hover') };
export const Bordered = { render: () => table('table-bordered') };
export const Small = { render: () => table('table-sm') };

export const InACard = {
  render: () => html`<div class="table-card">${table('table-hover')}</div>`,
};

export const Coloured = {
  render: () => html`
    <div class="d-flex flex-column gap-4">
      ${['primary', 'success', 'danger']
        .map((c) => html`<div class="table-card">${table(`table-${c} table-striped`)}</div>`)
        .join('')}
    </div>
  `,
};
