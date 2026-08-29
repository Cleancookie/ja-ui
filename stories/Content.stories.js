import { grid, html, icon, note, row, section, stack, uid } from './helpers.js';

/**
 * `<article>` **is** the card. There is no `.card`, no `.card-body`, no
 * `.card-title`, no `.card-header` and no `.card-footer` — a `<header>` and a
 * `<footer>` inside the article are the header and the footer.
 *
 * One idea runs through this whole family: because no element ships a margin,
 * something has to space stacked content, and that something is the container's
 * `gap`. Every block that legitimately holds flow content is a flex column with
 * `gap: var(--ja-flow-space)`. Change that one token and the page re-rhythms.
 */
export default {
  title: 'Elements/Content',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Document structure: the card, the aside, the figure, and the containers that hand ' +
          'out vertical rhythm. The library styles content, not layout — the 12-column grid ' +
          'is gone, so the multi-card layouts below are a two-line CSS grid written from the ' +
          'space tokens, exactly as a consuming page would write it.',
      },
    },
  },
};

export const Card = {
  parameters: {
    docs: {
      description: {
        story:
          'A bare `<article>`: chunky ink border, hard offset shadow with zero blur, generous ' +
          'padding, a real radius. This is the signature object of the library and everything ' +
          'else is quieter than it on purpose.',
      },
    },
  },
  render: () => html`
    <article style="max-inline-size:24rem">
      <h3>Invoice 2041</h3>
      <p>Northwind Traders — due in four days.</p>
      ${row(['<button class="primary sm">Pay now</button>', '<button class="secondary outline sm">Later</button>'])}
    </article>
  `,
};

export const HeaderAndFooter = {
  name: 'Card header and footer',
  parameters: {
    docs: {
      description: {
        story:
          'A `<header>` or `<footer>` inside an `<article>` exposes **no landmark** — ' +
          '`banner` and `contentinfo` are scoped to the document. That looks like a bug and ' +
          'is correct: these are the card\'s own head and foot, not the page\'s. Do not "fix" ' +
          'it with `role="banner"`, which would announce every card in a list as the site ' +
          'header.',
      },
    },
  },
  render: () => html`
    <article style="max-inline-size:26rem">
      <header>
        <hgroup>
          <h3>Northwind Traders</h3>
          <p>Account 8842</p>
        </hgroup>
      </header>
      <dl>
        <div>
          <dt>Outstanding</dt>
          <dd>£4,120.00</dd>
        </div>
        <div>
          <dt>Terms</dt>
          <dd>Net 30</dd>
        </div>
      </dl>
      <footer>Last updated <time datetime="2026-08-19">19 August 2026</time></footer>
    </article>
  `,
};

export const Interactive = {
  parameters: {
    docs: {
      description: {
        story:
          'A card lifts on hover in two cases: when it contains a hovered link (`:has(> ' +
          'a:hover)`), or when the author opts in with `.interactive`. There is deliberately ' +
          '**no `cursor: pointer`** on an article — a card is not a control. If the whole ' +
          'card is meant to be clickable the click target is the `<a>` inside it, which ' +
          'already carries the right cursor, the right focus ring and the right ' +
          'screen-reader semantics. The card merely reacts.',
      },
    },
  },
  render: () =>
    grid(
      [
        html`
          <article>
            <h3><a href="#interactive">Deploy pipeline</a></h3>
            <p>The whole card lifts, but the link is the target.</p>
          </article>
        `,
        html`
          <article class="interactive">
            <h3>Opted in</h3>
            <p><code>article.interactive</code> lifts on hover on its own.</p>
          </article>
        `,
        html`
          <article>
            <h3>Static</h3>
            <p>No link, no class, no movement.</p>
          </article>
        `,
      ],
      '16rem'
    ),
};

export const NestedCard = {
  name: 'Nested cards',
  parameters: {
    docs: {
      description: {
        story:
          'A card inside a card would stack two full shadows into a smear, so the inner one ' +
          'steps down to the smallest offset and reads as an inset panel. No class, no ' +
          'modifier — `article article` is the selector.',
      },
    },
  },
  render: () => html`
    <article style="max-inline-size:28rem">
      <h3>August</h3>
      <article>
        <h4>Invoice 2041</h4>
        <p>£4,120.00 — paid</p>
      </article>
      <article>
        <h4>Invoice 2042</h4>
        <p>£980.50 — pending</p>
      </article>
    </article>
  `,
};

export const Aside = {
  parameters: {
    docs: {
      description: {
        story:
          'An aside is tangential, so it sits **into** the page rather than on top of it: ' +
          'sunken paper instead of a raised card. Backgrounds are never flat here, and a dot ' +
          'grid is the cheapest honest texture there is — one radial gradient, no image and ' +
          'no network request. The second one carries `data-theme="dark"` on the element ' +
          'itself, which is a supported, first-class thing.',
      },
    },
  },
  render: () => {
    const first = uid('aside');
    const second = uid('aside');
    return grid(
      [
        html`
          <aside aria-labelledby="${first}">
            <h3 id="${first}">Worth knowing</h3>
            <p>Cascade layers are what let your own stylesheet win with no <code>!important</code>.</p>
          </aside>
        `,
        html`
          <aside data-theme="dark" aria-labelledby="${second}">
            <h3 id="${second}">A dark subtree</h3>
            <p>One attribute, on this element, inside an otherwise light page.</p>
          </aside>
        `,
      ],
      '18rem'
    );
  },
};

export const Figure = {
  parameters: {
    docs: {
      description: {
        story:
          'The reset already made images block-level and fluid, so a `<figure>` only has to ' +
          'space its caption off its subject. Alt text is not optional: the SVG below is ' +
          'inline and decorative, so it is `aria-hidden` and the meaning lives in the caption.',
      },
    },
  },
  render: () => html`
    <figure style="max-inline-size:24rem">
      <div
        aria-hidden="true"
        style="block-size:9rem;border:var(--ja-border);border-radius:var(--ja-radius);background-color:var(--ja-surface-sunken);background-image:radial-gradient(var(--ja-pattern-color) 1px,transparent 1px);background-size:var(--ja-pattern-size) var(--ja-pattern-size)"
      ></div>
      <figcaption>
        Figure 1 — the dot grid, drawn from <code>--ja-pattern-color</code> and
        <code>--ja-pattern-size</code>.
      </figcaption>
    </figure>
  `,
};

export const Rhythm = {
  name: 'Containers and rhythm',
  parameters: {
    docs: {
      description: {
        story:
          'An **unnamed** `<section>` maps to `generic` — no role, no landmark, invisible to ' +
          'assistive tech. Because it is usually semantically weightless it is styled ' +
          'weightlessly: it contributes rhythm and nothing else. `<main>` is the one landmark ' +
          'that is unambiguous wherever it appears, so it is safe to style bare, and it gets ' +
          'the larger gap. Page-level `<header>`/`<footer>` are styled only as `body > ' +
          'header` — a header nested in an article, an aside or a nav produces no landmark ' +
          'and would be styled wrongly by a bare selector.',
      },
    },
  },
  render: () =>
    stack([
      section(
        'section — rhythm only',
        html`
          <section>
            <p>Each child is spaced by the container.</p>
            <p>No element in this stack carries a margin.</p>
          </section>
        `
      ),
      note(
        'Reach for <code>&lt;article&gt;</code> or <code>&lt;aside&gt;</code> when you want a ' +
          'surface. A <code>&lt;section&gt;</code> is only promoted to a landmark by ' +
          '<code>aria-label</code> or <code>aria-labelledby</code>, and a landmark you did ' +
          'not mean to create is worse than none.'
      ),
    ]),
};

export const Composed = {
  name: 'A card grid',
  parameters: {
    docs: {
      description: {
        story:
          'Three cards, laid out by the page. The old spelling was `<div class="row g-4">` ' +
          'and `<div class="col-md-4">`; the new one is ' +
          '`grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr))` and a `gap` from ' +
          'the space scale. The library never had a better answer than CSS does.',
      },
    },
  },
  render: () =>
    grid(
      [
        ['Starter', '£0', 'One project, community support.', 'secondary outline'],
        ['Team', '£24', 'Ten projects, priority support.', 'primary'],
        ['Enterprise', 'Talk to us', 'SSO, audit log, an actual human.', 'secondary outline'],
      ].map(
        ([name, price, blurb, variant]) => html`
          <article>
            <header>
              <hgroup>
                <h3>${name}</h3>
                <p>${price}</p>
              </hgroup>
            </header>
            <p>${blurb}</p>
            <footer>
              <button class="${variant}">${icon('arrow')} Choose ${name}</button>
            </footer>
          </article>
        `
      ),
      '16rem'
    ),
};
