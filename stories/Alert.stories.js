import { COLORS, html, icon } from './helpers.js';

export default {
  title: 'Components/Alert',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Alerts carry a solid accent block rather than a tinted left border. ' +
          'Add `.alert-dismissible` and a `.btn-close` with `data-ja-dismiss="alert"` to make one closable.',
      },
    },
  },
};

const alert = (variant, body) => html`
  <div class="alert alert-${variant}" role="alert">
    <div class="alert-body">${body}</div>
  </div>
`;

export const Colours = {
  render: () =>
    `<div class="d-flex flex-column gap-3">${COLORS.map((c) =>
      alert(c, `This is a <strong>${c}</strong> alert — check it out.`)
    ).join('')}</div>`,
};

export const WithHeadingAndIcon = {
  render: () => html`
    <div class="alert alert-warning" role="alert">
      <span class="alert-icon">${icon('warn', 16)}</span>
      <div class="alert-body">
        <h4 class="alert-heading">Deployment is paused</h4>
        <p>Two of the three health checks are failing. Fix them, then resume the rollout.</p>
        <a href="#" class="alert-link">View the health check log</a>
      </div>
    </div>
  `,
};

export const Dismissible = {
  render: () => html`
    <div class="alert alert-success alert-dismissible fade show" role="alert">
      <span class="alert-icon">${icon('check', 16)}</span>
      <div class="alert-body"><strong>Saved.</strong> Your changes are live.</div>
      <button type="button" class="btn-close" data-ja-dismiss="alert" aria-label="Close"></button>
    </div>
  `,
};
