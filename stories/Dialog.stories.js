import { html, icon, note, row, section, stack, uid } from './helpers.js';

/**
 * `<dialog>` **is** the modal and `[popover]` **is** the dropdown surface. There
 * is no `.modal`, no `.modal-dialog`, no `.modal-backdrop`, no `.offcanvas` and
 * no `.dropdown-menu`, because the platform now ships all of those behaviours:
 * light dismiss, Esc to close, focus trapping, inert-ing the page behind, and a
 * stacking context that cannot be lost.
 *
 * **No z-index anywhere in this family.** A modal `<dialog>` and an open
 * `[popover]` are promoted to the *top layer*, which paints above the entire
 * document regardless of stacking contexts, transforms, filters or
 * `overflow: hidden` ancestors. The old library carried a whole z-index scale to
 * fight that fight; the top layer wins it for free.
 */
export default {
  title: 'Elements/Dialog',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Everything here opens with `command`/`commandfor` or `popovertarget` — declarative ' +
          'attributes, no event listeners. `command` reached Baseline only in December 2025 ' +
          'and an unsupported invoker button is simply *dead*, so ja-ui ships a click ' +
          'listener that fills the gap and binds nothing at all where the platform already ' +
          'implements it.',
      },
    },
  },
};

const mount = (markup, wire) => {
  const root = document.createElement('div');
  root.innerHTML = markup;
  wire?.(root);
  return root;
};

export const Modal = {
  parameters: {
    docs: {
      description: {
        story:
          'Two things the author still has to do. **Put `autofocus` on something inside every ' +
          'dialog** — the field the user is meant to fill, or the confirming button; without ' +
          'it the dialog itself takes focus and long content opens scrolled to the bottom, ' +
          'which is the single most common `<dialog>` bug. And **open it with `showModal()`, ' +
          'not `show()`** — `show()` renders it in the normal flow with no backdrop, no focus ' +
          'trap and no Esc. `command="show-modal"` does the right one for you.',
      },
    },
  },
  render: () => {
    const id = uid('dialog');
    const status = uid('dialog-status');
    return mount(
      html`
        ${stack([
          row([`<button class="primary" commandfor="${id}" command="show-modal">Open the dialog</button>`]),
          `<p id="${status}" style="color:var(--ja-text-muted)">Nothing returned yet.</p>`,
        ])}
        <dialog id="${id}" aria-labelledby="${id}-title">
          <header>
            <h2 id="${id}-title">Publish “Foundations”?</h2>
            <button class="icon" commandfor="${id}" command="close" aria-label="Close">${icon('close')}</button>
          </header>
          <div>
            <p>
              The page goes live immediately and the URL is permanent. The body region between
              the header and the footer is the only thing that scrolls — the dialog itself
              never does.
            </p>
            <p>Press <kbd>Esc</kbd> at any point. That is the platform, not this library.</p>
          </div>
          <footer>
            <button commandfor="${id}" command="close" value="cancel">Cancel</button>
            <button commandfor="${id}" command="close" value="publish" autofocus>Publish</button>
          </footer>
        </dialog>
      `,
      (root) => {
        const dialog = root.querySelector('dialog');
        const line = root.querySelector(`#${status}`);
        dialog.addEventListener('close', () => {
          line.textContent = dialog.returnValue
            ? `dialog.returnValue = "${dialog.returnValue}"`
            : 'Closed with Esc — no return value.';
        });
      }
    );
  },
};

export const FormDialog = {
  name: 'form method="dialog"',
  parameters: {
    docs: {
      description: {
        story:
          'A `<form method="dialog">` closes its dialog on submit and reports the pressed ' +
          "button's value in `dialog.returnValue` — no JS, no event listener, no " +
          '`data-bs-dismiss`. Both markup shapes are styled identically, so the header, body ' +
          'and footer can live inside the form or outside it. Tab to the field: the body ' +
          'region scrolls, and a scroll container clips at its padding box, so that region — ' +
          'not the dialog — carries the padding the focus ring needs to stay whole.',
      },
    },
  },
  render: () => {
    const id = uid('form-dialog');
    const status = uid('form-dialog-status');
    return mount(
      html`
        ${stack([
          row([`<button commandfor="${id}" command="show-modal">Rename the project</button>`]),
          `<p id="${status}" style="color:var(--ja-text-muted)">No name submitted yet.</p>`,
        ])}
        <dialog id="${id}" aria-labelledby="${id}-title">
          <form method="dialog">
            <header>
              <h2 id="${id}-title">Rename project</h2>
            </header>
            <div>
              <label>
                Project name
                <input name="name" value="ja-ui" autofocus />
              </label>
            </div>
            <footer>
              <button value="cancel" formnovalidate>Cancel</button>
              <button type="submit" value="rename">Rename</button>
            </footer>
          </form>
        </dialog>
      `,
      (root) => {
        const dialog = root.querySelector('dialog');
        const field = root.querySelector('input[name="name"]');
        const line = root.querySelector(`#${status}`);
        dialog.addEventListener('close', () => {
          line.textContent =
            dialog.returnValue === 'rename'
              ? `Renamed to “${field.value}” (returnValue = "rename").`
              : `Dismissed (returnValue = "${dialog.returnValue || 'none'}").`;
        });
      }
    );
  },
};

export const Drawer = {
  parameters: {
    docs: {
      description: {
        story:
          '`.offcanvas` is gone, and so is the second component it needed. A drawer is the ' +
          '**same `<dialog>`**, pinned to an edge: `class="drawer end"` re-pins it and swaps ' +
          'the scale entry for a slide, and every other rule — surface, backdrop, scroll ' +
          'lock, header/footer, form handling — applies unchanged. Still `showModal()`, still ' +
          'Esc, still focus-trapped. The edge classes are logical, so `.start` and `.end` ' +
          'flip in RTL on their own.',
      },
    },
  },
  render: () => {
    const edges = ['start', 'end', 'top', 'bottom'];
    const ids = Object.fromEntries(edges.map((edge) => [edge, uid(`drawer-${edge}`)]));
    return mount(html`
      ${row(edges.map((edge) => `<button commandfor="${ids[edge]}" command="show-modal">Open .${edge}</button>`))}
      ${edges
        .map(
          (edge) => html`
            <dialog id="${ids[edge]}" class="drawer ${edge}" aria-labelledby="${ids[edge]}-title">
              <header>
                <h2 id="${ids[edge]}-title">dialog.drawer.${edge}</h2>
                <button class="icon" commandfor="${ids[edge]}" command="close" aria-label="Close">${icon('close')}</button>
              </header>
              <div>
                <p>
                  One element, one extra class. The inline edges take a capped width and full
                  height; the block edges take full width and a capped height.
                </p>
              </div>
              <footer>
                <button commandfor="${ids[edge]}" command="close" autofocus>Done</button>
              </footer>
            </dialog>
          `
        )
        .join('')}
    `);
  },
};

export const Dropdown = {
  parameters: {
    docs: {
      description: {
        story:
          'A `[popover]` escapes `overflow: hidden` and every transformed ancestor for free, ' +
          'which is the entire reason the old dropdown needed a portal and this one does not. ' +
          'Where anchor positioning is supported the popover places itself against its ' +
          'invoker and flips rather than clipping; where it is not, the author owns placement ' +
          '— hence the `position: relative` wrapper below, which is the only layout in this ' +
          'story.\n\n' +
          '**This is a disclosure, never `role="menu"`.** `role="menu"` is a promise: arrow ' +
          'keys move between items, Home/End jump, Tab leaves the whole widget, typeahead ' +
          'works, and every child is a `role="menuitem"`. A button that toggles a popover ' +
          'containing a list of links is a correct, complete, announced disclosure — and it ' +
          'is the one you almost always want.',
      },
    },
  },
  render: () => {
    const menu = uid('menu');
    return mount(html`
      <span style="position:relative;display:inline-block">
        <button popovertarget="${menu}">${icon('user')} Account</button>
        <div popover id="${menu}">
          <ul role="list">
            <li><a href="#dropdown">${icon('gear')} Settings</a></li>
            <li><a href="#dropdown">${icon('bell')} Notifications</a></li>
            <li><hr /></li>
            <li><button type="button">${icon('arrow')} Sign out</button></li>
          </ul>
        </div>
      </span>
    `);
  },
};

export const Tooltip = {
  parameters: {
    docs: {
      description: {
        story:
          '`popover="hint"` is the tooltip surface. It has no Safari support at all, and an ' +
          'engine that does not know the value parses it as `popover="auto"` — so a hint ' +
          'degrades to a normal popover: it still opens, still light-dismisses, but it takes ' +
          'focus handling and closes its sibling auto popovers. That is a graceful landing, ' +
          'and it is exactly why **a hint must never be the only place a piece of information ' +
          'exists.** The button below is described by the hint via `aria-describedby`, so the ' +
          'text is announced whether or not the popover ever opens.',
      },
    },
  },
  render: () => {
    const hint = uid('hint');
    return mount(html`
      <span style="position:relative;display:inline-block">
        <button popovertarget="${hint}" aria-describedby="${hint}">
          ${icon('info')} What is a token?
        </button>
        <div popover="hint" id="${hint}">
          A CSS custom property in <code>tokens.css</code>. Override one and the whole library
          follows.
        </div>
      </span>
    `);
  },
};

export const Notes = {
  name: 'Known gaps',
  parameters: { docs: { description: { story: 'Two platform facts worth writing down.' } } },
  render: () =>
    stack([
      section(
        'Scroll lock',
        note(
          '<code>&lt;dialog&gt;</code> deliberately does not lock the page behind it — the ' +
            'spec makes the document <em>inert</em>, not unscrollable, so the wheel still ' +
            'moves the page under the modal. One <code>html:has(dialog:modal)</code> rule ' +
            'puts that right. iOS Safari still lets a <em>touch</em> drag scroll the document ' +
            'behind a modal; the only fixes are the <code>position: fixed</code> body hack, ' +
            'which loses scroll position, or JavaScript. Neither is worth it, so ja-ui does ' +
            'neither.'
        )
      ),
      section(
        'The backdrop',
        note(
          'Solid ink at opacity — no blur, here or anywhere in the library. ' +
            '<code>::backdrop</code> only started inheriting from its originating element in ' +
            'Chromium 122, Safari 17.4 and Firefox 120, so the backdrop colour is written ' +
            'twice: a literal, then the token. It is the only colour literal in the whole ' +
            'element layer.'
        )
      ),
    ]),
};
