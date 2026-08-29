import { html, note, section, stack } from './helpers.js';

/**
 * Prose, set by bare element selectors. Every rule in `elements/typography.css`
 * is `h1`, `p`, `blockquote`, `code`, `kbd`, `hr` — no `.display-3`, no
 * `.blockquote`, no `.text-muted`, no `.fs-4`.
 *
 * The two classes on this page are the whole typography inventory: `.lead`
 * (this paragraph is the standfirst) and `.measure` (hold this to a readable
 * line length). Both are the author choosing an intent, which is the only thing
 * a class is allowed to be here.
 */
export default {
  title: 'Elements/Typography',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Write ordinary prose and it is typeset. Nothing on this page carries a class ' +
          'except `.lead` and `.measure` — Bootstrap needed `.display-*`, `.lead`, `.fs-*`, ' +
          '`.fw-bold`, `.text-muted`, `.blockquote` and `.list-unstyled` to say the same ' +
          'things. Note also that no element here ships a margin: the vertical rhythm is the ' +
          "container's `gap`, from `--ja-flow-space`.",
      },
    },
  },
};

export const Prose = {
  parameters: {
    docs: {
      description: {
        story: 'The bare elements, with not one attribute or class between them.',
      },
    },
  },
  render: () => html`
    <article class="measure">
      <h1>Just another UI</h1>
      <p class="lead">
        A zero-dependency library that styles plain semantic HTML5. Drop it in, write
        ordinary markup, get a themed page.
      </p>
      <p>
        Body copy sits at <code>--ja-font-size</code> with a 1.6 line height and
        <code>text-wrap: pretty</code>, so a paragraph never ends on a single orphaned word.
        Inline semantics all work on their own: a <a href="#prose">link</a>,
        <strong>strong importance</strong>, <em>stressed emphasis</em>,
        <mark>a highlight</mark>, <s>struck-out text</s>, <ins>an insertion</ins>, an
        <abbr title="Accessible Rich Internet Applications">ARIA</abbr> abbreviation, H<sub>2</sub>O
        and E = mc<sup>2</sup>.
      </p>
      <p>
        <small>
          Small print is smaller <em>and</em> quieter — size alone reads as a mistake rather
          than as an intention.
        </small>
      </p>
    </article>
  `,
};

export const Headings = {
  parameters: {
    docs: {
      description: {
        story:
          'One major-third scale, continued upward from `--ja-font-size-xl` by `calc()`. ' +
          '`h6` lands at body size, so a deeply nested heading is never smaller than the ' +
          'text beneath it. `text-wrap: balance` keeps a two-line heading from dropping one ' +
          'short word onto its own line.',
      },
    },
  },
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:var(--ja-space-4)">
      <h1>Heading level one</h1>
      <h2>Heading level two</h2>
      <h3>Heading level three</h3>
      <h4>Heading level four</h4>
      <h5>Heading level five</h5>
      <h6>Heading level six</h6>
    </div>
  `,
};

export const Hgroup = {
  name: 'hgroup',
  parameters: {
    docs: {
      description: {
        story:
          'The current spec is narrow: exactly one heading plus one or more `<p>` that are ' +
          'its subtitle. Those paragraphs are part of the title block, not prose, so they ' +
          'are set as a subtitle and explicitly opted out of the heading\'s casing — which ' +
          'matters in the brutal skin, where headings are uppercase.',
      },
    },
  },
  render: () => html`
    <hgroup>
      <h1>Foundations</h1>
      <p>Colour, type, space, radii and elevation — the values every element reads.</p>
    </hgroup>
  `,
};

export const Lists = {
  parameters: {
    docs: {
      description: {
        story:
          'The marker is the one place a list gets colour, and it reads `--ja-accent` first ' +
          'so a variant class recolours the bullets with everything else. Nested lists indent ' +
          'by less than the top level: a full step twice over walks the content off a phone.',
      },
    },
  },
  render: () =>
    stack([
      section(
        'Unordered',
        html`
          <ul>
            <li>A bare list item</li>
            <li>
              With a nested list
              <ul>
                <li>Indented by a half step</li>
                <li>Padding, never margin</li>
              </ul>
            </li>
            <li>And a third</li>
          </ul>
        `
      ),
      section(
        'Ordered',
        html`
          <ol>
            <li>Branch, build, prove it</li>
            <li>Preview the site</li>
            <li>Commit with an emoji prefix</li>
          </ol>
        `
      ),
      section(
        'Tinted by the accent',
        html`
          <ul class="danger">
            <li>The markers read <code>--ja-accent</code></li>
            <li>So one class recolours the whole list</li>
          </ul>
        `
      ),
      note(
        'A list whose markers are removed loses its list role in Safari/VoiceOver — WebKit ' +
          'considers a markerless list not to be presented as a list, and it is WONTFIX. ' +
          'Every markerless list in this library therefore carries <code>role="list"</code>. ' +
          'See the Navigation page for the bordered <code>.list</code> spelling.'
      ),
    ]),
};

export const Quotations = {
  parameters: {
    docs: {
      description: {
        story:
          'A slab with a double-width bar down its edge, reading `--ja-accent` so ' +
          '`<blockquote class="success">` retints it. `<cite>` is deliberately *not* styled ' +
          'as an attribution byline: per spec it is the title of a work and must not mark up ' +
          "a person's name, and styling it that way would teach the wrong markup.",
      },
    },
  },
  render: () => html`
    <blockquote class="measure">
      <p>
        Element selectors first. Reach for a class only when the platform gives you nothing
        to select, or when the author is choosing an intent.
      </p>
      <footer>
        <small>The contract, <cite>ARCHITECTURE.md</cite></small>
      </footer>
    </blockquote>
  `,
};

export const Code = {
  parameters: {
    docs: {
      description: {
        story:
          'Inline `<code>` is a tinted slab with no border — at a 2px border width (4px in ' +
          'the brutal skin) a border round a two-word span swallows the words. The border and ' +
          'the hard shadow belong to `<pre>`, which scrolls rather than pushing a horizontal ' +
          'scrollbar onto the page. `<kbd>` is a keycap, and nested `<kbd>` is the spec ' +
          'spelling for a chord — only the inner keys look like keys.',
      },
    },
  },
  render: () =>
    stack([
      html`<p>
        Install with <code>npm i @cleancookie/ja-ui</code>, then press
        <kbd><kbd>Ctrl</kbd> + <kbd>K</kbd></kbd> to open the palette. The program printed
        <samp>ready in 84ms</samp>, where <var>ms</var> is milliseconds.
      </p>`,
      html`<pre><code>&lt;article&gt;
  &lt;h3&gt;Invoice 2041&lt;/h3&gt;
  &lt;p&gt;Northwind Traders&lt;/p&gt;
  &lt;button class="primary sm"&gt;Pay now&lt;/button&gt;
&lt;/article&gt;</code></pre>`,
    ]),
};

export const DescriptionList = {
  name: 'Description list',
  parameters: {
    docs: {
      description: {
        story:
          'A flat `<dl>` is a plain stack. Wrap each name/value pair in a `<div>` — which is ' +
          'legal HTML, and the only per-row hook the element gives us — and the list becomes ' +
          'a real two-column key/value table: the grid is declared on the `<dl>` and each row ' +
          'opts in with `subgrid`, so every key column lines up across the whole list.',
      },
    },
  },
  render: () =>
    stack([
      section(
        'Flat',
        html`
          <dl>
            <dt>Reference</dt>
            <dd>INV-2041</dd>
            <dt>Client</dt>
            <dd>Northwind Traders</dd>
          </dl>
        `
      ),
      section(
        'Grouped — two columns, aligned by subgrid',
        html`
          <dl>
            <div>
              <dt>Reference</dt>
              <dd>INV-2041</dd>
            </div>
            <div>
              <dt>Client</dt>
              <dd>Northwind Traders</dd>
            </div>
            <div>
              <dt>Issued</dt>
              <dd><time datetime="2026-08-19">19 August 2026</time></dd>
            </div>
          </dl>
        `
      ),
    ]),
};

export const Rule = {
  name: 'Horizontal rule',
  parameters: {
    docs: {
      description: {
        story:
          'A border on an `<hr>` is a hairline that no border-width makes honest across ' +
          'browsers. A filled block of a known thickness always is, so `<hr>` is drawn as a ' +
          '`block-size: var(--ja-border-width)` slab of ink.',
      },
    },
  },
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:var(--ja-space-5)">
      <p>Above the rule.</p>
      <hr />
      <p>Below the rule.</p>
    </div>
  `,
};
