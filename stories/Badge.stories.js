import { COLORS, html, icon, row, section } from './helpers.js';

export default {
  title: 'Components/Badge',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Badges are stickers: bordered, shadowed, and happy to sit at an angle.',
      },
    },
  },
};

export const Colours = {
  render: () => row(COLORS.map((c) => `<span class="badge bg-${c}">${c}</span>`)),
};

export const Subtle = {
  render: () => row(COLORS.map((c) => `<span class="badge bg-${c}-subtle">${c}</span>`)),
};

export const Shapes = {
  render: () =>
    row([
      '<span class="badge bg-primary">Square</span>',
      '<span class="badge bg-primary rounded-pill">Pill</span>',
      '<span class="badge badge-lg bg-pop">Large</span>',
      '<span class="badge badge-flat bg-fresh">Flat</span>',
      `<span class="badge bg-success">${icon('check', 12)} Verified</span>`,
      '<span class="badge badge-dot bg-danger" role="status" aria-label="Unread"></span>',
    ]),
};

export const InContext = {
  render: () => html`
    <div class="d-flex flex-column gap-5">
      ${section('On a button', row([
        '<button class="btn btn-primary">Inbox <span class="badge bg-pop">14</span></button>',
        '<button class="btn btn-outline-secondary">Drafts <span class="badge bg-secondary rounded-pill">3</span></button>',
      ]))}
      ${section('As a corner sticker', html`
        <div class="position-relative sticker p-4" style="max-inline-size: 18rem">
          <span class="badge badge-sticker bg-pop">New</span>
          <strong class="d-block">Quarterly report</strong>
          <span class="text-muted">Generated 4 minutes ago</span>
        </div>
      `)}
    </div>
  `,
};
