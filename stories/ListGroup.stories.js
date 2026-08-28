import { COLORS, html, icon } from './helpers.js';

export default {
  title: 'Components/List group',
  tags: ['autodocs'],
};

export const Basic = {
  render: () => html`
    <ul class="list-group" style="max-inline-size: 24rem">
      <li class="list-group-item">Deployment pipeline</li>
      <li class="list-group-item">Database migrations</li>
      <li class="list-group-item active" aria-current="true">Feature flags</li>
      <li class="list-group-item">Audit log</li>
      <li class="list-group-item disabled">Billing (coming soon)</li>
    </ul>
  `,
};

export const Actionable = {
  render: () => html`
    <div class="list-group" style="max-inline-size: 24rem">
      <a href="#" class="list-group-item list-group-item-action active">${icon('bell')} Notifications</a>
      <a href="#" class="list-group-item list-group-item-action">${icon('search')} Search settings</a>
      <a href="#" class="list-group-item list-group-item-action">${icon('star')} Favourites</a>
    </div>
  `,
};

export const Numbered = {
  render: () => html`
    <ol class="list-group list-group-numbered" style="max-inline-size: 24rem">
      <li class="list-group-item">Install the package</li>
      <li class="list-group-item">Import the stylesheet</li>
      <li class="list-group-item">Write plain HTML</li>
    </ol>
  `,
};

export const Coloured = {
  render: () => html`
    <ul class="list-group" style="max-inline-size: 24rem">
      ${COLORS.map((c) => `<li class="list-group-item list-group-item-${c}">${c}</li>`).join('')}
    </ul>
  `,
};

export const Horizontal = {
  render: () => html`
    <ul class="list-group list-group-horizontal">
      <li class="list-group-item">One</li>
      <li class="list-group-item">Two</li>
      <li class="list-group-item">Three</li>
    </ul>
  `,
};
