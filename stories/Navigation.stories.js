import { html, icon, note, section, stack, uid } from './helpers.js';

/**
 * The platform gives us exactly one navigation element — `<nav>` — and a handful
 * of ARIA states. Everything in this family is built from those two things.
 *
 * `.navbar`, `.nav-link`, `.nav-tabs`, `.breadcrumb-item`, `.page-link` and
 * `.list-group-item` are all gone. What is left is `<nav>` plus a list, and
 * `aria-current="page"` — one attribute that means "this is the one you are on"
 * in a navbar, a breadcrumb, a pagination list and a list group alike.
 */
export default {
  title: 'Elements/Navigation',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Three things in this family are accessibility decisions rather than styling ones. ' +
          'Breadcrumb separators are `::before` content and **never DOM text**, because a ' +
          'literal "/" is read out ("Home slash Docs slash Tokens"). Removing a list marker ' +
          'strips the list role in Safari/VoiceOver, so every markerless list here carries ' +
          '`role="list"`. And every `<nav>` carries an `aria-label`, because a page with three ' +
          'unlabelled navigation landmarks is a page a screen-reader user cannot navigate.',
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

/**
 * The navbar is inferred from position — `body > header > nav` — not from a
 * class, so it can only be demonstrated by actually putting a header at the top
 * of the document. This mounts one and takes it away again when the story
 * leaves the DOM.
 */
function portal(root, markup) {
  const host = document.createElement('header');
  host.innerHTML = markup;
  document.body.prepend(host);

  let seen = root.isConnected;
  const scope = document.getElementById('storybook-root') ?? document.body;
  const observer = new MutationObserver(() => {
    if (root.isConnected) {
      seen = true;
      return;
    }
    if (!seen) return;
    observer.disconnect();
    host.remove();
  });
  observer.observe(scope, { childList: true, subtree: true });
  return host;
}

export const Nav = {
  name: 'nav',
  parameters: {
    docs: {
      description: {
        story:
          'A `<nav>` has no box of its own: it is a landmark, not a component. It inherits ' +
          'the page, ships no margin, and only lays out whatever list it contains. Links ' +
          'inside it read as targets rather than prose — no underline until you interact, and ' +
          'a real 44px touch target even when the label is one word. The active item is ' +
          '`aria-current="page"`, which draws an inset bar in the accent.',
      },
    },
  },
  render: () => html`
    <nav aria-label="Documentation sections">
      <ul role="list">
        <li><a href="#nav" aria-current="page">Overview</a></li>
        <li><a href="#nav">Tokens</a></li>
        <li><a href="#nav">Elements</a></li>
        <li><a href="#nav">Templates</a></li>
      </ul>
    </nav>
  `,
};

export const Navbar = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'The site navbar is inferred from **position**, not from a class: `body > header > ' +
          'nav`. A `<nav>` nested anywhere else — in an aside, in a footer, inside a card — ' +
          'stays a plain row of links, which is the right answer. `.sticky` is opt-in and is ' +
          'the only place in the whole navigation file that touches the stacking order. ' +
          '\n\nBelow **576px** the bar stops wrapping into three stacked rows. The list is ' +
          'sent to a row of its own and scrolls along its inline axis, so the navbar is two ' +
          'rows tall whatever it holds and however many links are in it — brand and actions ' +
          'on one, the links on the other. Narrow the preview to see it: no class, no wrapper ' +
          'element and no script, because there is no platform element for "collapse this nav ' +
          'behind a button" that does not need markup the consumer never wrote.' +
          '\n\nThis story mounts a real `<header>` at the top of the preview document and ' +
          'removes it again when you navigate away — scroll up to see it. Tab once to reveal ' +
          'the skip link.',
      },
    },
  },
  render: () => {
    const root = document.createElement('div');
    root.innerHTML = html`
      <div style="padding:var(--ja-space-5);display:flex;flex-direction:column;gap:var(--ja-space-4)">
        <p>The navbar is above, at the top of the document. Press <kbd>Tab</kbd> to reveal the skip link.</p>
        <p id="navbar-main-target">Skip-link destination.</p>
      </div>
    `;
    portal(
      root,
      html`
        <a class="skip primary" href="#navbar-main-target">Skip to content</a>
        <nav class="sticky" aria-label="Main">
          <a href="#navbar">ja&nbsp;ui</a>
          <ul role="list">
            <li><a href="#navbar" aria-current="page">Docs</a></li>
            <li><a href="#navbar">Examples</a></li>
            <li><a href="#navbar">Changelog</a></li>
          </ul>
          <button class="icon" data-ja-theme-toggle aria-label="Toggle the theme">${icon('gear')}</button>
        </nav>
      `
    );
    return root;
  },
};

export const Breadcrumb = {
  parameters: {
    docs: {
      description: {
        story:
          'Selecting on an `aria-label`\'s **value** is normally forbidden in this library — ' +
          'the value is author prose and it is translated, so `[aria-label="Breadcrumb"]` ' +
          'silently stops matching the moment the page ships in French. This is the one ' +
          'grudging exception, because the ARIA authoring practice for a breadcrumb *is* ' +
          '`<nav aria-label="Breadcrumb">`. **`.breadcrumb` is the reliable spelling**; the ' +
          'attribute selector is a convenience for markup that already follows the APG.',
      },
    },
  },
  render: () =>
    stack([
      section(
        'Matched by the aria-label',
        html`
          <nav aria-label="Breadcrumb">
            <ol role="list">
              <li><a href="#breadcrumb">Home</a></li>
              <li><a href="#breadcrumb">Docs</a></li>
              <li><a href="#breadcrumb">Elements</a></li>
              <li><a href="#breadcrumb" aria-current="page">Navigation</a></li>
            </ol>
          </nav>
        `
      ),
      section(
        'Matched by the class — translation-proof',
        html`
          <nav class="breadcrumb" aria-label="Fil d’Ariane">
            <ol role="list">
              <li><a href="#breadcrumb">Accueil</a></li>
              <li><a href="#breadcrumb">Docs</a></li>
              <li><a href="#breadcrumb" aria-current="page">Navigation</a></li>
            </ol>
          </nav>
        `
      ),
      note(
        'There is no “/” in the markup above. The separator is <code>::before</code> content ' +
          'on <code>li + li</code>, so the trail is announced as the four links it actually ' +
          'is. If you want a chevron, swap the <code>content</code> string — do not put it in ' +
          'the HTML.'
      ),
    ]),
};

export const Pagination = {
  parameters: {
    docs: {
      description: {
        story:
          'Same grudging `aria-label` exception, same escape hatch: `.pagination` is the ' +
          'reliable spelling. Page numbers are chunky bordered chips with the full press ' +
          'physics, because they are buttons in everything but element name. The page you are ' +
          'on is filled with the accent rather than underlined, and it reads the variant ' +
          'contract — `<nav class="pagination danger">` retints the lot. A disabled ' +
          'prev/next uses **`aria-disabled`, not `disabled`**: a control removed from the tab ' +
          'order is a control the user cannot find again.',
      },
    },
  },
  render: () => html`
    <nav aria-label="Pagination">
      <ol role="list">
        <li><a href="#pagination" aria-disabled="true">Previous</a></li>
        <li><a href="#pagination">1</a></li>
        <li><a href="#pagination" aria-current="page">2</a></li>
        <li><a href="#pagination">3</a></li>
        <li><a href="#pagination">4</a></li>
        <li><a href="#pagination">Next</a></li>
      </ol>
    </nav>
  `,
};

export const Tabs = {
  parameters: {
    docs: {
      description: {
        story:
          '**There is no native tabs element.** `<details name>` gives you an accordion, not ' +
          'a tablist, and nothing in HTML gives you roving focus — so this is the full W3C ' +
          'APG pattern, styled entirely off `aria-selected` and `aria-orientation`, with a ' +
          'small JS module for the keyboard model.\n\n' +
          'The contract, all of it required: the tab **must** be a real `<button>` (role does ' +
          'not grant behaviour); exactly one tab carries `tabindex="0"` and the rest carry ' +
          '`-1`, so Tab moves past the whole tablist and the arrows move within it; ' +
          '`aria-selected` goes on **every** tab, `true` on one and `false` on the rest — ' +
          'omitting it on the inactive ones is the single most common bug in this pattern; ' +
          'panels are shown and hidden with the `hidden` attribute, which takes them out of ' +
          'the accessibility tree too.\n\n' +
          'Try it: arrow keys, Home and End, and `aria-orientation="vertical"` on the second ' +
          'set to move Up/Down instead.',
      },
    },
  },
  render: () => {
    const build = (prefix, orientation) => {
      const ids = ['General', 'Billing', 'Members'].map((label) => ({
        label,
        tab: uid(`${prefix}-tab`),
        panel: uid(`${prefix}-panel`),
      }));
      return html`
        <div${orientation === 'vertical' ? ' style="display:grid;grid-template-columns:auto 1fr;gap:var(--ja-space-4)"' : ''}>
          <div role="tablist" aria-label="${prefix} settings"${orientation === 'vertical' ? ' aria-orientation="vertical"' : ''}>
            ${ids
              .map(
                ({ label, tab, panel }, index) => html`
                  <button
                    role="tab"
                    id="${tab}"
                    aria-controls="${panel}"
                    aria-selected="${index === 0}"
                    tabindex="${index === 0 ? 0 : -1}"
                  >
                    ${label}
                  </button>
                `
              )
              .join('')}
          </div>
          ${ids
            .map(
              ({ label, tab, panel }, index) => html`
                <div
                  role="tabpanel"
                  id="${panel}"
                  aria-labelledby="${tab}"
                  tabindex="0"
                  ${index === 0 ? '' : 'hidden'}
                >
                  <p>The ${label.toLowerCase()} panel. The panel takes <code>tabindex="0"</code> so
                  keyboard users can reach non-focusable content inside it.</p>
                </div>
              `
            )
            .join('')}
        </div>
      `;
    };

    return mount(
      stack([
        section('Horizontal — activation follows focus', build('Horizontal')),
        section('Vertical — Up/Down arrows', build('Vertical', 'vertical')),
        note(
          'Activation follows focus by default, which is the APG recommendation when panels ' +
            'are cheap to show. Put <code>data-ja-activation="manual"</code> on the tablist ' +
            'when a panel is expensive, and the arrows move focus without selecting.'
        ),
      ])
    );
  },
};

export const List = {
  name: 'List group',
  parameters: {
    docs: {
      description: {
        story:
          '`.list-group` and `.list-group-item` become `<ul role="list" class="list">` and ' +
          '`<li>`. A row that is *itself* a link or a button fills its cell, so the whole row ' +
          'is the target rather than the few words inside it — and `role="list"` is ' +
          'load-bearing, not decorative: WebKit strips the list role the moment CSS removes ' +
          'the marker, taking the item count and the list boundaries with it. Inside an ' +
          '`<article>` the class can be dropped: `article > ul[role="list"]` is styled the ' +
          'same way.',
      },
    },
  },
  render: () =>
    stack([
      section(
        'Plain rows',
        html`
          <ul role="list" class="list">
            <li>Deployed to production</li>
            <li>Rebuilt the search index</li>
            <li>Rotated the API keys</li>
          </ul>
        `
      ),
      section(
        'Rows that are links, with the current one marked',
        html`
          <ul role="list" class="list">
            <li><a href="#list" aria-current="page">${icon('gear')} Settings</a></li>
            <li><a href="#list">${icon('user')} Members</a></li>
            <li><a href="#list">${icon('bell')} Notifications</a></li>
          </ul>
        `
      ),
      section(
        'Inside a card — no class needed',
        html`
          <article style="max-inline-size:24rem">
            <h3>Recent activity</h3>
            <ul role="list">
              <li>INV-2041 paid</li>
              <li>INV-2042 sent</li>
              <li>INV-2043 overdue</li>
            </ul>
          </article>
        `
      ),
    ]),
};
