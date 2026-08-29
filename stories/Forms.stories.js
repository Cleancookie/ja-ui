import { html, icon, note, row, section, stack, uid } from './helpers.js';

/**
 * A plain `<form>` with plain `<label>`s and plain `<input>`s comes out fully
 * themed. There is no `.form-control`, no `.form-label`, no `.form-select`, no
 * `.form-check` and no `.form-group` — the element is the selector.
 *
 * Two things run through the whole family:
 *   1. Inputs **light up**, they do not glow. On `:focus-visible` a control
 *      fills with `--ja-focus-fill`. There is no soft shadow in this library,
 *      and a focus glow is the one shadow that cannot be hard-edged.
 *   2. Validation is `:user-invalid`, never `:invalid` — the latter matches an
 *      empty required field on page load and tells someone off for not yet
 *      having done something.
 */
export default {
  title: 'Elements/Forms',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The whole form family, classless. A `<form>` is a grid with the flow gap, so a ' +
          "bare `<input>` fills the form's measure with no `inline-size` declaration and no " +
          '`.row`/`.col-*` scaffolding — and your own `form { display: block }` beats it with ' +
          'no `!important`, because everything here is in a cascade layer.',
      },
    },
  },
};

/* Every story that submits is a demo with nowhere to go. */
const mount = (markup, wire) => {
  const root = document.createElement('div');
  root.innerHTML = markup;
  root.addEventListener('submit', (event) => event.preventDefault());
  wire?.(root);
  return root;
};

export const Bare = {
  parameters: {
    docs: {
      description: {
        story:
          'Four elements and one attribute. The wrapping-label spelling — ' +
          '`<label>Name <input></label>` — needs no `for` and no `id`, so it is the spelling ' +
          'that is impossible to get wrong, and it is the one the library optimises for.',
      },
    },
  },
  render: () =>
    mount(html`
      <form style="max-inline-size:24rem">
        <label>
          Full name
          <input name="name" autocomplete="name" />
        </label>
        <label>
          Email
          <input type="email" name="email" autocomplete="email" placeholder="you@example.com" />
        </label>
        <button type="submit">Create account</button>
      </form>
    `),
};

export const TextControls = {
  name: 'Text controls',
  parameters: {
    docs: {
      description: {
        story:
          'The selector for a text box is a **negation**, not an enumeration: `<input>` with ' +
          'no type at all and `<input type="quux">` with a typo both render as text fields, ' +
          'and an enumeration would leave exactly those two unstyled. `<textarea>` uses ' +
          '`field-sizing: content` to grow with what you type — an engine without it simply ' +
          'keeps a fixed box, which is what every textarea has always done.',
      },
    },
  },
  render: () => {
    const listId = uid('cities');
    return mount(html`
      <form style="display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:var(--ja-space-4)">
        <label>Text <input value="Northwind Traders" /></label>
        <label>Email <input type="email" value="ops@northwind.test" /></label>
        <label>Password <input type="password" value="hunter2" /></label>
        <label>Number <input type="number" value="12" min="0" max="99" /></label>
        <label>Date <input type="date" value="2026-08-19" /></label>
        <label>Time <input type="time" value="09:30" /></label>
        <label>URL <input type="url" value="https://example.com" /></label>
        <label>Telephone <input type="tel" value="+44 161 496 0000" /></label>
        <label>
          City
          <input list="${listId}" placeholder="Start typing…" />
        </label>
        <datalist id="${listId}">
          <option value="Bristol"></option>
          <option value="Leeds"></option>
          <option value="Manchester"></option>
        </datalist>
        <label>
          Select
          <select>
            <optgroup label="Warehouse">
              <option>Manchester</option>
              <option selected>Leeds</option>
            </optgroup>
            <optgroup label="Retail">
              <option>Bristol</option>
            </optgroup>
          </select>
        </label>
        <label style="grid-column:1/-1">
          Notes
          <textarea rows="3" placeholder="Grows as you type…"></textarea>
        </label>
        <label>Read only <input value="INV-2041" readonly /></label>
        <label>Disabled <input value="Locked" disabled /></label>
      </form>
    `);
  },
};

export const ChoiceControls = {
  name: 'Checkbox, radio, switch',
  parameters: {
    docs: {
      description: {
        story:
          'The tick is a real polygon clipped out of a solid block — not a rotated-border L ' +
          'and not a font glyph, since this library downloads nothing. `:indeterminate` is ' +
          'styled too: it can only be set from JS, which is why a tri-state "select all" box ' +
          'so often looks simply unchecked. The **switch** is ' +
          '`input[type="checkbox"][role="switch"]`, so the markup that earns the switch look ' +
          'is exactly the markup that earns the switch semantics — it announces on/off ' +
          'rather than checked.',
      },
    },
  },
  render: () => {
    const group = uid('shipping');
    return mount(
      html`
        <form>
          <fieldset>
            <legend>Notifications</legend>
            <label><input type="checkbox" checked /> Email me about deploys</label>
            <label><input type="checkbox" /> Email me about billing</label>
            <label><input type="checkbox" data-indeterminate /> Everything else</label>
            <label><input type="checkbox" disabled /> Disabled</label>
          </fieldset>

          <fieldset>
            <legend>Shipping</legend>
            <label><input type="radio" name="${group}" checked /> Standard, 3–5 days</label>
            <label><input type="radio" name="${group}" /> Express, next day</label>
            <label><input type="radio" name="${group}" disabled /> Same day (unavailable)</label>
          </fieldset>

          <fieldset>
            <legend>Preferences</legend>
            <label><input type="checkbox" role="switch" checked /> Dark mode</label>
            <label><input type="checkbox" role="switch" /> Reduced motion</label>
            <label class="success"><input type="checkbox" role="switch" checked /> Tinted by the accent</label>
          </fieldset>
        </form>
      `,
      (root) => {
        const box = root.querySelector('[data-indeterminate]');
        if (box) box.indeterminate = true;
      }
    );
  },
};

export const OtherControls = {
  name: 'Range, colour, file',
  parameters: {
    docs: {
      description: {
        story:
          'The range track and thumb are given the same `block-size`, which is the trick that ' +
          'centres the thumb in WebKit without the negative `margin-top` every other recipe ' +
          'on the web uses — this library ships no margins. The file input styles ' +
          '`::file-selector-button` with the same border and shadow tokens as a real button, ' +
          'so the two cannot drift apart.',
      },
    },
  },
  render: () =>
    mount(html`
      <form style="max-inline-size:28rem">
        <label>
          Volume
          <input type="range" min="0" max="100" value="60" />
        </label>
        <label class="danger">
          Tinted range
          <input type="range" min="0" max="100" value="35" />
        </label>
        <label>
          Brand colour
          <input type="color" value="#8b5cf6" />
        </label>
        <label>
          Attach a file
          <input type="file" />
        </label>
      </form>
    `),
};

export const Fieldsets = {
  parameters: {
    docs: {
      description: {
        story:
          'A `<fieldset>` groups related controls and its `<legend>` names the group — which ' +
          'is what a screen reader reads before each radio in it. The one real modern gotcha ' +
          'is `min-inline-size: min-content` in the UA sheet, which stops a fieldset ever ' +
          'shrinking below its widest child inside a flex or grid parent; it is zeroed. ' +
          '`fieldset[disabled]` disables every descendant — with one exception that is easy ' +
          'to miss: the contents of the **first** `<legend>` are explicitly not disabled by ' +
          'the spec, so a toggle living in the legend still works and must not be greyed out.',
      },
    },
  },
  render: () =>
    mount(html`
      <form style="display:grid;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr));gap:var(--ja-space-4)">
        <fieldset>
          <legend>Billing address</legend>
          <label>Street <input autocomplete="street-address" /></label>
          <label>Post code <input autocomplete="postal-code" /></label>
        </fieldset>
        <fieldset disabled>
          <legend>Delivery address (same as billing)</legend>
          <label>Street <input /></label>
          <label>Post code <input /></label>
        </fieldset>
      </form>
    `),
};

export const Search = {
  parameters: {
    docs: {
      description: {
        story:
          '`<search>` is a genuinely new element with an implicit `role="search"` landmark. ' +
          'An engine that does not know it renders it inline and the form inside collapses, ' +
          'so it is given a box; it also almost always holds a field and a button on one ' +
          'line, so it gets the row. WebKit draws a clear ✕ inside a search field and Firefox ' +
          'never has, which is why that ✕ is left exactly as the UA draws it and is never the ' +
          'only way to clear the field.',
      },
    },
  },
  render: () => {
    const id = uid('search-field');
    return mount(html`
      <search>
        <label class="visually-hidden" for="${id}">Search invoices</label>
        <input id="${id}" type="search" placeholder="Search invoices…" />
        <button type="submit">${icon('search')} Search</button>
      </search>
    `);
  },
};

export const Progress = {
  name: 'Progress, meter, output',
  parameters: {
    docs: {
      description: {
        story:
          '`.progress`/`.progress-bar` are gone: `<progress>` is the element. The **track is ' +
          'styled on the element itself**, not on a pseudo, because the engines disagree ' +
          'about what the pseudos mean — `::-webkit-progress-bar` is the track, but Firefox ' +
          'has no track pseudo at all and `::-moz-progress-bar` is the *fill*. A `<progress>` ' +
          'with **no `value`** means "working, length unknown", which is a different message ' +
          'from `value="0"`, so it gets the barber pole. `<output>` is the only element in ' +
          'HTML with an implicit live-region role — change its text and it is announced with ' +
          'no ARIA written by hand.',
      },
    },
  },
  render: () => {
    const rangeId = uid('budget');
    const outputId = uid('budget-out');
    return mount(
      html`
        <div style="display:flex;flex-direction:column;gap:var(--ja-space-5);max-inline-size:32rem">
          ${section(
            'progress',
            html`
              <label>Uploading — 40% <progress value="40" max="100"></progress></label>
              <label class="success">Indexing — 82% <progress class="success" value="82" max="100"></progress></label>
              <label>Working, length unknown <progress></progress></label>
            `
          )}
          ${section(
            'meter',
            html`
              <label>Disk used — 7.2 of 10 GB <meter value="7.2" min="0" max="10" low="3" high="8" optimum="2"></meter></label>
            `
          )}
          ${section(
            'output',
            html`
              <form style="display:flex;flex-wrap:wrap;align-items:center;gap:var(--ja-space-4)">
                <label style="flex:1 1 14rem">
                  Monthly budget
                  <input id="${rangeId}" type="range" min="0" max="500" step="10" value="220" />
                </label>
                <p>
                  <output id="${outputId}" for="${rangeId}">£220</output>
                  <span class="visually-hidden">per month</span>
                </p>
              </form>
            `
          )}
        </div>
      `,
      (root) => {
        const range = root.querySelector(`#${rangeId}`);
        const out = root.querySelector(`#${outputId}`);
        range?.addEventListener('input', () => {
          out.textContent = `£${range.value}`;
        });
      }
    );
  },
};

export const Validation = {
  parameters: {
    docs: {
      description: {
        story:
          'The single most important rule in the form file. `:invalid` matches an empty ' +
          'required field the instant the page loads, so a form styled with it is painted red ' +
          'before the visitor has typed a character. `:user-invalid` waits until the field has ' +
          'been interacted with and blurred, or the form submitted. **Tab through the first ' +
          'field without typing** — nothing happens. Type one character, delete it, and blur: ' +
          'now it is invalid. `[aria-invalid="true"]` gets the same look for a rule the ' +
          'constraint API cannot express, such as a server-side check.',
      },
    },
  },
  render: () => {
    const errorId = uid('account-error');
    return mount(html`
      <form style="max-inline-size:26rem">
        <label>
          Email (required)
          <input type="email" required placeholder="you@example.com" />
        </label>
        <label>
          Account number — server rejected this one
          <input value="8842-01" aria-invalid="true" aria-describedby="${errorId}" />
        </label>
        <p id="${errorId}"><strong>No account matches 8842-01.</strong></p>
        <label>
          Post code (valid)
          <input value="M1 4BT" pattern="[A-Za-z0-9 ]+" required />
        </label>
        <button type="submit">Submit</button>
      </form>
    `);
  },
};

export const FullForm = {
  name: 'A whole form',
  parameters: {
    docs: {
      description: {
        story:
          'Everything above, assembled. Count the classes: `.visually-hidden` once, and ' +
          'nothing else. The submit button is primary because it is the submit button, and ' +
          'the cancel button is quiet because it carries `formnovalidate`.',
      },
    },
  },
  render: () =>
    mount(html`
      <article style="max-inline-size:34rem">
        <header>
          <hgroup>
            <h2>New invoice</h2>
            <p>Everything on this form is a bare element.</p>
          </hgroup>
        </header>
        <form>
          <label>
            Client
            <select>
              <option>Northwind Traders</option>
              <option>Contoso Ltd</option>
              <option>Fabrikam Inc</option>
            </select>
          </label>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:var(--ja-space-4)">
            <label>Amount <input type="number" min="0" step="0.01" value="4120.00" /></label>
            <label>Due <input type="date" value="2026-09-19" /></label>
          </div>
          <label>
            Notes
            <textarea rows="3" placeholder="Visible on the invoice"></textarea>
          </label>
          <fieldset>
            <legend>Delivery</legend>
            <label><input type="checkbox" role="switch" checked /> Email a copy to the client</label>
            <label><input type="checkbox" /> Attach the timesheet</label>
          </fieldset>
          ${row([
            '<button type="submit">Send invoice</button>',
            '<button type="submit" formnovalidate>Save draft</button>',
          ])}
        </form>
      </article>
    `),
};

export const Notes = {
  name: 'What is deliberately absent',
  parameters: { docs: { description: { story: 'The gaps, and why they are gaps.' } } },
  render: () =>
    stack([
      note(
        '<strong>The browser validation bubble</strong> ("Please fill out this field") has ' +
          'been completely unstyleable in every engine since 2013. A custom message means ' +
          '<code>novalidate</code> on the form, listening for the <code>invalid</code> event ' +
          'and rendering it yourself — there is no CSS path, and this library ships none.'
      ),
      note(
        '<strong>The datalist popup</strong> is drawn by the browser outside the page\'s ' +
          'stylesheet. It takes no colour, no font, no radius and no max-height, and it ' +
          'ignores page zoom entirely. It is genuinely useful and genuinely unstyleable — if ' +
          'the design needs a styled popup, that is a combobox, and a combobox is JS.'
      ),
      note(
        '<strong>A three-colour meter</strong> is impossible cross-engine: WebKit exposes ' +
          'three band pseudos and Firefox exposes one. The same value would be green in one ' +
          'browser and amber in another, so every band gets one colour on purpose. If the ' +
          'band carries meaning, say it in text — colour alone never carries meaning anyway.'
      ),
      note(
        '<strong>Customizable select</strong> (<code>appearance: base-select</code>) is ' +
          'shipped behind <code>@supports</code>. It is the best-degrading feature on the ' +
          'list: an engine that does not know it renders the classic native dropdown, ' +
          'complete and correct, with nothing to polyfill and nothing to detect.'
      ),
    ]),
};
