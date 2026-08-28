import { html } from './helpers.js';

export default {
  title: 'Layout/Grid',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A 12-column flexbox grid using real `gap` for gutters — no negative margins, ' +
          'no floats. Same `.row` / `.col-*` / `.g-*` classes as Bootstrap.',
      },
    },
  },
};

const cell = (label) => `<div class="sticker bg-primary-subtle p-3 text-center fw-bold">${label}</div>`;

export const Columns = {
  render: () => html`
    <div class="d-flex flex-column gap-4">
      <div class="row">
        ${[1, 2, 3].map(() => `<div class="col">${cell('col')}</div>`).join('')}
      </div>
      <div class="row">
        <div class="col-8">${cell('col-8')}</div>
        <div class="col-4">${cell('col-4')}</div>
      </div>
      <div class="row">
        <div class="col-6 col-md-3">${cell('6 / md-3')}</div>
        <div class="col-6 col-md-3">${cell('6 / md-3')}</div>
        <div class="col-6 col-md-3">${cell('6 / md-3')}</div>
        <div class="col-6 col-md-3">${cell('6 / md-3')}</div>
      </div>
      <div class="row">
        <div class="col-4 offset-4">${cell('offset-4')}</div>
      </div>
    </div>
  `,
};

export const Gutters = {
  render: () => html`
    <div class="d-flex flex-column gap-4">
      ${[0, 2, 4, 5]
        .map(
          (g) => html`
            <div>
              <code class="fs-xs">g-${g}</code>
              <div class="row g-${g} mt-2">
                ${[1, 2, 3, 4].map(() => `<div class="col-3">${cell('')}</div>`).join('')}
              </div>
            </div>
          `
        )
        .join('')}
    </div>
  `,
};

export const Stacks = {
  render: () => html`
    <div class="d-flex flex-column gap-5">
      <div class="vstack" style="max-inline-size: 20rem">
        ${cell('vstack item')}${cell('vstack item')}${cell('vstack item')}
      </div>
      <div class="hstack">
        ${cell('hstack')}${cell('hstack')}<div class="vr"></div>${cell('hstack')}
      </div>
    </div>
  `,
};
