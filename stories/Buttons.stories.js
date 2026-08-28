import { COLORS, html, icon, row, section } from './helpers.js';

export default {
  title: 'Components/Button',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Buttons lift toward you on hover and press into the page on click, ' +
          'their hard shadow shrinking to meet them. Same class names as Bootstrap 5, ' +
          'plus `.btn-soft-*`, `.btn-ghost`, `.btn-flat`, `.btn-icon` and `.btn-block`.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: COLORS },
    style: { control: 'inline-radio', options: ['solid', 'outline', 'soft'] },
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    variant: 'primary',
    style: 'solid',
    size: 'default',
    label: 'Click me',
    disabled: false,
  },
  render: ({ variant, style, size, label, disabled }) => {
    const prefix = style === 'solid' ? 'btn-' : style === 'outline' ? 'btn-outline-' : 'btn-soft-';
    const sizeClass = size === 'default' ? '' : ` btn-${size}`;
    return html`<button
      type="button"
      class="btn ${prefix}${variant}${sizeClass}"
      ${disabled ? 'disabled' : ''}
    >
      ${label}
    </button>`;
  },
};

export const Playground = {};

export const Solid = {
  render: () => row(COLORS.map((c) => `<button class="btn btn-${c}">${c}</button>`)),
};

export const Outline = {
  render: () => row(COLORS.map((c) => `<button class="btn btn-outline-${c}">${c}</button>`)),
};

export const Soft = {
  render: () => row(COLORS.map((c) => `<button class="btn btn-soft-${c}">${c}</button>`)),
};

export const Sizes = {
  render: () =>
    row([
      '<button class="btn btn-primary btn-sm">Small</button>',
      '<button class="btn btn-primary">Default</button>',
      '<button class="btn btn-primary btn-lg">Large</button>',
    ]),
};

export const WithIcons = {
  render: () =>
    row([
      `<button class="btn btn-primary">${icon('plus')} New record</button>`,
      `<button class="btn btn-outline-secondary">Continue ${icon('arrow')}</button>`,
      `<button class="btn btn-soft-danger">${icon('trash')} Delete</button>`,
      `<button class="btn btn-primary btn-icon" aria-label="Notifications">${icon('bell')}</button>`,
      `<button class="btn btn-primary">Get started <span class="btn-bubble">${icon('arrow', 12)}</span></button>`,
    ]),
};

export const Variations = {
  render: () => html`
    <div class="d-flex flex-column gap-5">
      ${section('Ghost & flat — for toolbars and dense tables', row([
        '<button class="btn btn-ghost">Ghost</button>',
        '<button class="btn btn-flat btn-soft-primary">Flat</button>',
        '<button class="btn btn-link">Link button</button>',
      ]))}
      ${section('Square corners & full width', html`
        <div class="d-flex flex-column gap-3" style="max-inline-size: 20rem">
          <button class="btn btn-primary btn-square">Square</button>
          <button class="btn btn-outline-primary btn-block">Block</button>
        </div>
      `)}
      ${section('Disabled', row([
        '<button class="btn btn-primary" disabled>Disabled</button>',
        '<button class="btn btn-outline-primary" disabled>Disabled</button>',
      ]))}
    </div>
  `,
};

export const Groups = {
  render: () => html`
    <div class="d-flex flex-column gap-4">
      <div class="btn-group" role="group" aria-label="Text alignment">
        <button class="btn btn-outline-secondary active">Left</button>
        <button class="btn btn-outline-secondary">Centre</button>
        <button class="btn btn-outline-secondary">Right</button>
      </div>

      <div class="btn-toolbar">
        <div class="btn-group">
          <button class="btn btn-primary">Save</button>
          <button class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-ja-toggle="dropdown" aria-label="More save options"></button>
        </div>
        <div class="btn-group">
          <input type="radio" class="btn-check" name="view" id="view-grid" checked />
          <label class="btn btn-outline-secondary" for="view-grid">Grid</label>
          <input type="radio" class="btn-check" name="view" id="view-list" />
          <label class="btn btn-outline-secondary" for="view-list">List</label>
        </div>
      </div>

      <div class="btn-group-vertical" style="inline-size: 12rem">
        <button class="btn btn-outline-secondary">Top</button>
        <button class="btn btn-outline-secondary">Middle</button>
        <button class="btn btn-outline-secondary">Bottom</button>
      </div>
    </div>
  `,
};

export const Toggle = {
  render: () =>
    row([
      '<button class="btn btn-outline-primary" data-ja-toggle="button" aria-pressed="false">Toggle me</button>',
      '<button class="btn btn-outline-primary active" data-ja-toggle="button" aria-pressed="true">Already on</button>',
    ]),
};
