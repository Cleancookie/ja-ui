import { html, note, stack, uid } from './helpers.js';

/**
 * `<details>`/`<summary>` **is** the accordion. There is no `.accordion`, no
 * `.accordion-item`, no `.accordion-button`, no `.collapse`, no
 * `data-bs-toggle`, no `aria-expanded` to keep in sync and no JavaScript at all.
 *
 * What you get that a JS accordion cannot give you: find-in-page opens the
 * panel and scrolls to the match, Ctrl+P prints the content whether or not it
 * was open on screen, and it works with JavaScript broken, blocked or still
 * downloading.
 */
export default {
  title: 'Elements/Disclosure',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The honest trade, up front: `<details>` does **not** expose the ARIA Authoring ' +
          'Practices accordion pattern. It exposes N independent group/button pairs — so ' +
          'there is no roving arrow-key navigation between the headers (Tab, not Down), no ' +
          '"2 of 5" position announcement, and no heading semantics unless you put a heading ' +
          'inside the `<summary>`. For an FAQ, a settings group or a "show the details" ' +
          'panel that trade is the right one, and it is the default here. If you genuinely ' +
          'need the APG keyboard model, build the APG widget — see the tabs on the ' +
          'Navigation page for what that costs.',
      },
    },
  },
};

export const Bare = {
  parameters: {
    docs: {
      description: {
        story:
          'Two elements, no attributes. The chevron is drawn from two borders, so it inherits ' +
          'the ink weight and the current colour and needs no asset, no font and no SVG. The ' +
          'panel animates open with a `0fr → 1fr` grid row transition, upgraded to a real ' +
          '`::details-content` height animation — gated twice — where the engine has it.',
      },
    },
  },
  render: () => html`
    <details>
      <summary>What does ja-ui actually ship?</summary>
      <div>
        <p>
          One stylesheet and a small JavaScript file. The stylesheet is the library; the
          script is only the remainder the platform does not do for you.
        </p>
      </div>
    </details>
  `,
};

export const Open = {
  name: 'Open, and with a heading',
  parameters: {
    docs: {
      description: {
        story:
          'A heading inside the `<summary>` is the recommended markup — it is what puts the ' +
          'panel in the document outline — and it must not bring its own scale, so it ' +
          'inherits the summary\'s type. The panel is given **one** element: several siblings ' +
          'all land in the same grid cell and stack on top of each other.',
      },
    },
  },
  render: () => html`
    <details open>
      <summary><h3>Cascade layers</h3></summary>
      <div>
        <p>
          Unlayered CSS beats layered CSS regardless of specificity, so a consumer's own
          stylesheet wins with no <code>!important</code> and no specificity archaeology.
        </p>
        <p>That is why the layer order is the first thing in <code>index.css</code>.</p>
      </div>
    </details>
  `,
};

export const Accordion = {
  parameters: {
    docs: {
      description: {
        story:
          'A run of adjacent `<details>` reads as one accordion with no wrapper and no class: ' +
          '`details:has(+ details)` and `details + details` collapse the doubled border ' +
          'between neighbours and round only the outer corners. The hard shadow is left on ' +
          'every item deliberately — neighbours touch with no gap, so each downward shadow is ' +
          'painted over by the item below and the run casts one continuous shadow.',
      },
    },
  },
  render: () => html`
    <div>
      <details open>
        <summary>Do I need the JavaScript?</summary>
        <div><p>Only for tabs, the theme toggle, the invoker fallback and the two non-native components.</p></div>
      </details>
      <details>
        <summary>Does it work with my own CSS?</summary>
        <div><p>Yes — your unlayered rules beat every layered rule in the library.</p></div>
      </details>
      <details>
        <summary>Is there a build step?</summary>
        <div><p>No. It is one stylesheet and one module.</p></div>
      </details>
    </div>
  `,
};

export const Exclusive = {
  name: 'Exclusive accordion (name=)',
  parameters: {
    docs: {
      description: {
        story:
          'Give every `<details>` in a run the same `name` and opening one closes the rest — ' +
          'no JS and no state to hold. An engine that does not know the attribute ignores it ' +
          'and lets the panels open independently: the content is all still there, still ' +
          'reachable, still printable, which is why this ships unguarded. One catch: a named ' +
          'group can have at most one panel open, so `open` on two of them is resolved by the ' +
          'browser keeping the last.',
      },
    },
  },
  render: () => {
    const name = uid('faq');
    return html`
      <div>
        ${[
          ['Where do the tokens live?', 'In <code>src/styles/tokens.css</code> — every visual value in the library, both skins, all three theme states.'],
          ['How do variants avoid specificity fights?', 'Every variant class is a token remap and nothing else, and they live one cascade layer above the element rules.'],
          ['What replaced the grid?', 'Your page CSS. The library styles content, not layout.'],
        ]
          .map(
            ([question, answer]) => html`
              <details name="${name}">
                <summary>${question}</summary>
                <div><p>${answer}</p></div>
              </details>
            `
          )
          .join('')}
      </div>
    `;
  },
};

export const Tinted = {
  parameters: {
    docs: {
      description: {
        story:
          'The summary reads `--ja-accent` with `transparent` as its fallback, so the colour ' +
          'axis works on it exactly as it does on a button. Hover is painted as a flat ' +
          '`linear-gradient` image of `--ja-surface-hover` rather than a background colour, ' +
          'which is what lets one rule tint an accented summary and a plain one alike.',
      },
    },
  },
  render: () =>
    stack([
      html`
        <div>
          <details class="danger">
            <summary>Delete this workspace</summary>
            <div><p>This cannot be undone, and it takes the audit log with it.</p></div>
          </details>
          <details class="success">
            <summary>Everything is fine</summary>
            <div><p>Nothing to see here.</p></div>
          </details>
        </div>
      `,
      note(
        'Reduced motion keeps the state change and drops the slide — the panel still opens, ' +
          'it just stops travelling.'
      ),
    ]),
};
