import { COLORS, html, row, section } from './helpers.js';

export default {
  title: 'Components/Feedback',
  tags: ['autodocs'],
};

export const Progress = {
  render: () => html`
    <div class="d-flex flex-column gap-4" style="max-inline-size: 32rem">
      <div class="progress" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar" style="inline-size: 25%">25%</div>
      </div>
      <div class="progress progress-sm">
        <div class="progress-bar bg-success" style="inline-size: 60%"></div>
      </div>
      <div class="progress progress-lg">
        <div class="progress-bar bg-pop progress-bar-striped progress-bar-animated" style="inline-size: 75%">75%</div>
      </div>
      <div class="progress-stacked">
        <div class="progress" style="inline-size: 30%"><div class="progress-bar bg-success"></div></div>
        <div class="progress" style="inline-size: 20%"><div class="progress-bar bg-warning"></div></div>
        <div class="progress" style="inline-size: 12%"><div class="progress-bar bg-danger"></div></div>
      </div>
    </div>
  `,
};

export const Spinners = {
  render: () =>
    row([
      '<span class="spinner-border" role="status" aria-label="Loading"></span>',
      '<span class="spinner-border spinner-border-sm text-danger" role="status"></span>',
      '<span class="spinner-border spinner-border-lg text-success" role="status"></span>',
      '<span class="spinner-grow" role="status"></span>',
      '<span class="spinner-dots" role="status"><i></i></span>',
      '<button class="btn btn-primary" disabled><span class="spinner-border spinner-border-sm"></span> Saving…</button>',
    ], 4),
};

export const Placeholders = {
  render: () => html`
    <div class="card placeholder-glow" style="max-inline-size: 22rem">
      <div class="card-body">
        <h5 class="card-title"><span class="placeholder" style="inline-size: 60%"></span></h5>
        <p class="card-text d-flex flex-column gap-2">
          <span class="placeholder" style="inline-size: 100%"></span>
          <span class="placeholder" style="inline-size: 92%"></span>
          <span class="placeholder" style="inline-size: 70%"></span>
        </p>
        <span class="placeholder btn btn-primary" style="inline-size: 8rem"></span>
      </div>
    </div>
  `,
};

export const Badges = {
  render: () =>
    section(
      'Every colour',
      row(COLORS.map((c) => `<span class="badge bg-${c}">${c}</span>`))
    ),
};
