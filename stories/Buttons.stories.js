import { COLORS, TREATMENTS, html, icon, note, row, section, stack, uid } from './helpers.js';

/**
 * `<button>Save</button>` is a finished button. There is no `.btn`.
 *
 * `.btn .btn-primary .btn-sm` becomes `class="primary sm"`, and the two words
 * that are left are pure intent — the element already said it was a button.
 * Every variant here is a **token remap only**: `.primary` sets `--ja-accent`
 * and `--ja-accent-fg`, nothing else, which is why the same class works
 * identically on `<button>`, `a.button`, `input[type=submit]`, a callout and a
 * badge.
 */
export default {
  title: 'Elements/Buttons',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Two composing axes — colour and treatment — plus two sizes. The interaction is ' +
          'the house personality: at rest the button casts a hard offset shadow, on hover it ' +
          'lifts toward you and the shadow grows by exactly the distance it moved, pressed it ' +
          'sinks and the shadow shrinks by the same amount. The far corner never moves, so it ' +
          'reads as a physical object rather than a sliding rectangle.',
      },
    },
  },
};

export const Bare = {
  parameters: {
    docs: {
      description: {
        story:
          'No class, no attribute. This is the whole point: the element is already the ' +
          'component. `input[type=button|submit|reset]` and `a.button` render identically — ' +
          '`a.button` is the one class in the file, and only because the platform gives no ' +
          'element for "a link that acts as a button".',
      },
    },
  },
  render: () =>
    row([
      '<button>Save</button>',
      '<input type="button" value="Input button" />',
      '<a class="button" href="#bare">Link button</a>',
    ]),
};

export const Colour = {
  parameters: {
    docs: {
      description: {
        story:
          'Ten classes. Each sets exactly two tokens — the fill and the ink authored to be ' +
          'legible on it in both themes and both skins. `.plain` is the opt-out: `initial` on ' +
          'a custom property is the guaranteed-invalid value, so the button falls all the way ' +
          "through to its own default even when a colour was inherited from an ancestor.",
      },
    },
  },
  render: () =>
    row([...COLORS.map((c) => `<button class="${c}">${c}</button>`), '<button class="plain">plain</button>']),
};

export const Treatment = {
  parameters: {
    docs: {
      description: {
        story:
          'The second axis, and it composes with any colour: `class="danger outline"`. All ' +
          'three treatments drop the filled surface, so the accent has to carry the text — ' +
          '`--ja-accent-ink` pulls it 30% toward the page\'s own text colour, which darkens ' +
          'it on a light page and *lightens* it on a dark one. One expression, both ' +
          'directions. `.ghost` also zeroes the lift: with no shadow there is nothing for the ' +
          'movement to be of.',
      },
    },
  },
  render: () =>
    stack(
      ['filled', ...TREATMENTS].map((treatment) =>
        section(
          treatment,
          row(
            ['primary', 'success', 'warning', 'danger', 'dark'].map(
              (c) =>
                `<button class="${c}${treatment === 'filled' ? '' : ` ${treatment}`}">${c}</button>`
            )
          )
        )
      )
    ),
};

export const Size = {
  parameters: {
    docs: {
      description: {
        story:
          'Two sizes, both remapped from the control token scale. The radius is deliberately ' +
          'untouched — `--ja-btn-radius-base` is a pill in the default skin and `0` in ' +
          'brutal, and both are already size-agnostic. The default height is 44px, a real ' +
          'touch target, before any padding is considered.',
      },
    },
  },
  render: () =>
    row([
      '<button class="primary sm">Small</button>',
      '<button class="primary">Default</button>',
      '<button class="primary lg">Large</button>',
    ]),
};

export const TreatmentAndSize = {
  name: 'Treatment × size',
  parameters: {
    docs: {
      description: {
        story:
          'The two axes are independent, and the shadow is where that is easiest to get ' +
          'wrong. A treatment decides **whether** there is a shadow (`.ghost` says none); a ' +
          'size decides **how deep** it is. They read through separate tokens — ' +
          '`--ja-btn-shadow` for the treatment, `--ja-btn-shadow-base` for the size — so ' +
          '`class="ghost sm"` stays flat. Every ghost row below must show nothing but ink at ' +
          'rest: a ghost button with a shadow is a hard dark arc floating over whatever is ' +
          'behind it, with no fill and no border to explain it.\n\n' +
          '**Where ghost belongs:** the third and fourth actions in a row, an icon-only ' +
          'control in a toolbar or a toast, a close button, and a `<button>` that has to ' +
          'read as a nav link. **Where it does not:** alone, as the only action on the ' +
          'screen — with no fill, no border and no lift, a lone ghost button does not read ' +
          'as a control at all.',
      },
    },
  },
  render: () =>
    stack(
      ['filled', ...TREATMENTS].map((treatment) =>
        section(
          treatment,
          row(
            ['sm', '', 'lg'].map((size) => {
              const cls = ['primary', treatment === 'filled' ? '' : treatment, size]
                .filter(Boolean)
                .join(' ');
              return `<button class="${cls}">${size || 'default'}</button>`;
            })
          )
        )
      )
    ),
};

export const WithIcons = {
  name: 'Icons',
  parameters: {
    docs: {
      description: {
        story:
          'A direct `<svg>` child is sized in `em`, so it tracks the label and never shrinks ' +
          'when the label wraps. An **icon-only** button squares itself off to the 44px ' +
          'minimum — `.icon` is the explicit spelling, and CSS can also infer it from ' +
          '`:has(> svg):not(:has(> :not(svg)))`. An icon-only button carries no text, so it ' +
          'needs an accessible name: either `aria-label` or a `.visually-hidden` span.',
      },
    },
  },
  render: () =>
    stack([
      section(
        'Icon and label',
        row([
          `<button class="primary">${icon('plus')} New invoice</button>`,
          `<button class="secondary outline">Export ${icon('download')}</button>`,
          `<button class="danger ghost">${icon('trash')} Delete</button>`,
        ])
      ),
      section(
        'Icon only — named with aria-label',
        row([
          `<button class="icon" aria-label="Search">${icon('search')}</button>`,
          `<button class="icon primary" aria-label="Add">${icon('plus')}</button>`,
          `<button class="icon danger outline" aria-label="Delete invoice">${icon('trash')}</button>`,
        ])
      ),
      section(
        'Icon only — named with visually-hidden text',
        row([
          `<button class="icon soft">${icon('gear')}<span class="visually-hidden">Settings</span></button>`,
          `<button class="icon soft">${icon('bell')}<span class="visually-hidden">Notifications</span></button>`,
        ])
      ),
    ]),
};

export const States = {
  parameters: {
    docs: {
      description: {
        story:
          '`:disabled` and `[aria-disabled="true"]` look the same and mean different things. ' +
          'A `disabled` button leaves the tab order entirely; `aria-disabled` keeps it ' +
          'focusable and announceable, which is what you want when the button needs to ' +
          'explain *why* it is unavailable — and it is the only spelling available to ' +
          '`a.button`, which cannot take `:disabled` at all.',
      },
    },
  },
  render: () =>
    stack([
      section(
        'Disabled',
        row([
          '<button class="primary" disabled>Disabled</button>',
          '<button class="danger outline" disabled>Disabled</button>',
          '<button class="primary" aria-disabled="true">aria-disabled</button>',
          '<a class="button" href="#states" aria-disabled="true">Link, aria-disabled</a>',
        ])
      ),
      section(
        'Busy',
        stack([
          row([
            '<button class="primary" aria-busy="true">Saving</button>',
            '<button class="secondary outline" aria-busy="true">Uploading</button>',
          ]),
          note(
            '<code>aria-busy</code> draws a ring with one quadrant missing, and stops the ' +
              'button lifting on hover — a busy button should not also be inviting a click. ' +
              'It announces nothing on its own, though: it is a mute switch, not a message, ' +
              'so pair it with a live region and <strong>always clear it</strong> when the ' +
              'work finishes.'
          ),
        ])
      ),
    ]),
};

export const Toggle = {
  parameters: {
    docs: {
      description: {
        story:
          '`aria-pressed` is ARIA **state**, which is exactly what the element layer is ' +
          'allowed to select on — a toggle that is on is genuinely held down, so it gets the ' +
          'pressed shadow and the pressed offset. These buttons really work: click one.',
      },
    },
  },
  render: () => {
    const root = document.createElement('div');
    root.innerHTML = row([
      `<button aria-pressed="false">${icon('star')} Star</button>`,
      `<button class="primary" aria-pressed="true">${icon('bell')} Notify</button>`,
      `<button class="success soft" aria-pressed="false">Auto-renew</button>`,
    ]);
    root.addEventListener('click', (event) => {
      const button = event.target.closest('[aria-pressed]');
      if (!button) return;
      button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
    return root;
  },
};

export const Inference = {
  parameters: {
    docs: {
      description: {
        story:
          'Some intent is already in the markup and needs no class at all. The submit button ' +
          'of a form **is** the primary action; the way out of a dialog is quiet. Those rules ' +
          'live in the `ja.elements` layer, one below `ja.variants`, which is the whole ' +
          'mechanism: `<button type="submit" class="danger">` comes out red purely on layer ' +
          'order, with no `:not()` chain to defend it. Open the dialog to see the third rule ' +
          '— its `autofocus` button is its default action.',
      },
    },
  },
  render: () => {
    const dialogId = uid('inference-dialog');
    const root = document.createElement('div');
    root.innerHTML = stack([
      section(
        'button[type=submit] is the primary action — no class',
        html`
          <form style="display:flex;flex-direction:row;flex-wrap:wrap;gap:var(--ja-space-3);align-items:center">
            <button type="submit">Save changes</button>
            <button type="submit" formnovalidate>Save draft</button>
            <button type="button">Cancel</button>
          </form>
        `
      ),
      section(
        'An explicit class still wins — layer order beats specificity',
        html`
          <form class="danger" style="display:flex;flex-direction:row;flex-wrap:wrap;gap:var(--ja-space-3);align-items:center">
            <button type="submit">Delete account</button>
            <button type="button" class="plain">Keep it</button>
          </form>
        `
      ),
      section(
        'dialog button[autofocus] is the default action; command=close is quiet',
        html`
          <p>
            <button commandfor="${dialogId}" command="show-modal">Open the dialog</button>
          </p>
          <dialog id="${dialogId}" aria-labelledby="${dialogId}-title">
            <header>
              <h2 id="${dialogId}-title">Publish this page?</h2>
            </header>
            <div>
              <p>Neither button below carries a colour class. The markup already said which
              one is the default and which one is the way out.</p>
            </div>
            <footer>
              <button commandfor="${dialogId}" command="close">Cancel</button>
              <button commandfor="${dialogId}" command="close" value="publish" autofocus>Publish</button>
            </footer>
          </dialog>
        `
      ),
      note(
        'There is no native signal for "destructive". <code>[type=reset]</code> wipes a form ' +
          'with no undo and no confirmation, it is a documented anti-pattern, and painting it ' +
          'red would be advertising it — so <code>.danger</code> is the only spelling.'
      ),
    ]);
    // The demo forms have nowhere to go — keep the Storybook frame from navigating.
    root.addEventListener('submit', (event) => event.preventDefault());
    return root;
  },
};
