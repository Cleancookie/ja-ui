import { html, uid } from './helpers.js';

export default {
  title: 'Components/Accordion',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Driven by the `Collapse` component. Give each toggle `data-ja-parent` to make ' +
          'opening one panel close its siblings.',
      },
    },
  },
};

const item = (id, parent, title, body, open = false) => html`
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button
        class="accordion-button ${open ? '' : 'collapsed'}"
        type="button"
        data-ja-toggle="collapse"
        data-ja-target="#${id}"
        data-ja-parent="#${parent}"
        aria-expanded="${open}"
        aria-controls="${id}"
      >
        ${title}
      </button>
    </h2>
    <div id="${id}" class="collapse ${open ? 'show' : ''}">
      <div class="accordion-body">${body}</div>
    </div>
  </div>
`;

export const Basic = {
  render: () => {
    const parent = uid('demo-accordion');
    return html`
      <div class="accordion" id="${parent}" style="max-inline-size: 36rem">
        ${item(uid('acc'), parent, 'What is ja-ui?', 'A zero-dependency component library that mirrors Bootstrap 5’s class names with a very different personality.', true)}
        ${item(uid('acc'), parent, 'Do I need a build step?', 'No. Drop the stylesheet in and write HTML. The JavaScript is optional and only needed for interactive components.')}
        ${item(uid('acc'), parent, 'Can I retheme it?', 'Every visual decision is a CSS custom property on <code>:root</code>. Override the ones you care about.')}
      </div>
    `;
  },
};

export const Collapse = {
  render: () => html`
    <div class="d-flex flex-column gap-3" style="max-inline-size: 36rem">
      <button
        class="btn btn-primary"
        type="button"
        data-ja-toggle="collapse"
        data-ja-target="#plain-collapse"
        aria-expanded="false"
        aria-controls="plain-collapse"
      >
        Toggle a region
      </button>
      <div class="collapse" id="plain-collapse">
        <div class="card"><div class="card-body">Anything can live in a collapsing region.</div></div>
      </div>
    </div>
  `,
};
