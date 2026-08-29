import { COLORS, html, grid, note, row, section, stack } from './helpers.js';

/**
 * The token layer. Everything visual in ja-ui is a `--ja-*` custom property in
 * `src/styles/tokens.css` — no element file contains a colour, a radius, a
 * shadow or a duration literal. Override one on `:root`, on `<body>` or on any
 * subtree and the whole library follows.
 *
 * There was never a Bootstrap class for any of this: `$primary`, `$spacer` and
 * `$box-shadow` were Sass variables that had to be recompiled. These are live
 * custom properties, so a theme swap is one attribute at runtime.
 */
export default {
  title: 'Foundations/Tokens',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Every visual value in the library is a `--ja-*` custom property. Two skins ' +
          '(`data-style="brutal"` selects the second) and three theme states — system, ' +
          '`light`, `dark` — are the same token block resolved differently. Both attributes ' +
          'work on `<html>`, on `<body>`, or on any subtree, which is what the last two ' +
          'stories on this page demonstrate. Use the toolbar to drive the whole site.',
      },
    },
  },
};

/* A single swatch: the fill token above, its name and its paired ink below. */
const swatch = (name) => html`
  <div style="border:var(--ja-border);border-radius:var(--ja-radius);overflow:clip;background:var(--ja-surface)">
    <div style="background:var(--ja-${name});color:var(--ja-${name}-fg);padding:var(--ja-space-4);font-weight:var(--ja-font-weight-bold)">
      Aa
    </div>
    <div style="padding:var(--ja-space-3);border-block-start:var(--ja-border)">
      <strong style="display:block">${name}</strong>
      <code>--ja-${name}</code>
    </div>
  </div>
`;

export const Colour = {
  parameters: {
    docs: {
      description: {
        story:
          'The ten colour variants, each a pair: the fill (`--ja-primary`) and the ink that ' +
          'was authored to be legible on it in both themes and both skins ' +
          '(`--ja-primary-fg`). A `.primary` class sets exactly those two tokens and nothing ' +
          'else — that is the entire colour axis.',
      },
    },
  },
  render: () => grid(COLORS.map(swatch), '11rem'),
};

const SURFACES = [
  ['--ja-body-bg', 'the page'],
  ['--ja-surface', 'cards, dialogs, controls'],
  ['--ja-surface-raised', 'popovers, keycaps'],
  ['--ja-surface-sunken', 'table feet, tracks, asides'],
  ['--ja-ink-fill', 'table heads, code blocks, tooltips'],
  ['--ja-focus-fill', 'a lit-up input'],
];

export const Surfaces = {
  parameters: {
    docs: {
      description: {
        story:
          'Paper, and the ink on it. `--ja-ink-fill` is split out from `--ja-ink` so the dark ' +
          'theme can dial the solid slab down instead of dropping a light block into the ' +
          'middle of a dark page.',
      },
    },
  },
  render: () =>
    stack([
      grid(
        SURFACES.map(
          ([token, use]) => html`
            <div style="background:var(${token});color:var(--ja-text);padding:var(--ja-space-4);border:var(--ja-border);border-radius:var(--ja-radius)">
              <code>${token}</code>
              <p style="font-size:var(--ja-font-size-sm)">${use}</p>
            </div>
          `
        ),
        '15rem'
      ),
      note(
        'Ink comes in three weights: <code>--ja-text</code>, <code>--ja-text-muted</code> and ' +
          '<code>--ja-text-subtle</code>. The brutal skin collapses all three to solid ink, ' +
          'because neo-brutalism has no subtle greys — it is black, or it is a colour.'
      ),
    ]),
};

const TYPE_SCALE = [
  ['--ja-font-size-xs', '0.75rem'],
  ['--ja-font-size-sm', '0.875rem'],
  ['--ja-font-size', '1rem'],
  ['--ja-font-size-lg', '1.125rem'],
  ['--ja-font-size-xl', '1.25rem'],
];

export const TypeScale = {
  name: 'Type scale',
  parameters: {
    docs: {
      description: {
        story:
          'A major third (1.25). The heading sizes continue the same ratio upward with a ' +
          '`calc()` on `--ja-font-size-xl` rather than five more hard-coded rem values — see ' +
          'the Typography page for the rendered run.',
      },
    },
  },
  render: () =>
    stack(
      TYPE_SCALE.map(
        ([token, value]) => html`
          <p style="display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--ja-space-4);font-size:var(${token})">
            <span>Just another UI</span>
            <code style="font-size:var(--ja-font-size-xs)">${token}</code>
            <small>${value}</small>
          </p>
        `
      ),
      3
    ),
};

export const Space = {
  parameters: {
    docs: {
      description: {
        story:
          'An 8px rhythm with 4px half-steps. No element in the library ships a margin, so ' +
          'this scale is spent almost entirely on `padding` and `gap` — `--ja-flow-space` is ' +
          'the one every content container reads for its vertical rhythm.',
      },
    },
  },
  render: () =>
    stack(
      [0, 1, 2, 3, 4, 5, 6, 7, 8].map(
        (step) => html`
          <div style="display:flex;align-items:center;gap:var(--ja-space-3)">
            <code style="inline-size:9rem;flex:none">--ja-space-${step}</code>
            <div style="block-size:var(--ja-space-5);inline-size:var(--ja-space-${step});background:var(--ja-primary);border:var(--ja-border)"></div>
          </div>
        `
      ),
      2
    ),
};

const RADII = [
  '--ja-radius-xs',
  '--ja-radius-sm',
  '--ja-radius',
  '--ja-radius-lg',
  '--ja-radius-xl',
  '--ja-radius-pill',
  '--ja-radius-blob',
];

export const Radii = {
  parameters: {
    docs: {
      description: {
        story:
          '`--ja-radius-blob` is the signature asymmetric speech-bubble corner. The brutal ' +
          'skin zeroes every one of these except the pill: sharp or fully round, nothing in ' +
          'between.',
      },
    },
  },
  render: () =>
    grid(
      RADII.map(
        (token) => html`
          <div style="display:flex;flex-direction:column;gap:var(--ja-space-2);align-items:center">
            <div style="inline-size:100%;block-size:4.5rem;background:var(--ja-surface);border:var(--ja-border);border-radius:var(${token})"></div>
            <code>${token}</code>
          </div>
        `
      ),
      '10rem'
    ),
};

const SHADOWS = [
  '--ja-shadow-xs',
  '--ja-shadow-sm',
  '--ja-shadow',
  '--ja-shadow-lg',
  '--ja-shadow-xl',
  '--ja-shadow-2xl',
];

export const Elevation = {
  parameters: {
    docs: {
      description: {
        story:
          'Every shadow in the library is a hard offset with **zero blur**. There is no soft ' +
          'shadow anywhere, which is also why a focused input fills with ' +
          '`--ja-focus-fill` instead of glowing. `--ja-shadow-hover` and ' +
          '`--ja-shadow-active` sit exactly one `--ja-lift` either side of `--ja-shadow`, so ' +
          'the far corner of a pressed button never moves.',
      },
    },
  },
  render: () =>
    grid(
      SHADOWS.map(
        (token) => html`
          <div style="background:var(--ja-surface);border:var(--ja-border);border-radius:var(--ja-radius);box-shadow:var(${token});padding:var(--ja-space-4)">
            <code>${token}</code>
          </div>
        `
      ),
      '12rem',
      6
    ),
};

/* One compact specimen, rendered once per skin and once per theme state. */
const specimen = html`
  <article>
    <header>
      <h3>Invoice 2041</h3>
    </header>
    <p>Northwind Traders — due in four days.</p>
    ${row([
      '<button class="primary">Pay now</button>',
      '<button class="secondary outline">Later</button>',
      '<span class="badge success">Paid</span>',
    ])}
  </article>
`;

export const Skins = {
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          '`data-style="brutal"` overrides **tokens only** — not one element rule changes ' +
          'between the two skins. The selector is bare, so the attribute works on any ' +
          'subtree: the right-hand panel below is a plain `<div data-style="brutal">` inside ' +
          'this otherwise-default page.',
      },
    },
  },
  render: () => html`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr));gap:var(--ja-space-5)">
      ${section('Playful geometric (default)', specimen)}
      <div data-style="brutal">${section('Neo-brutalism', specimen)}</div>
    </div>
  `,
};

export const ThemeStates = {
  name: 'Theme states',
  parameters: {
    docs: {
      description: {
        story:
          'Three states, never a boolean — a boolean breaks the person who toggled once and ' +
          'later changed their OS preference. The first panel has **no attribute** and ' +
          'follows the operating system; the other two are forced. Each is a subtree, which ' +
          'is a supported, first-class thing: `<aside data-theme="dark">` inside a light page ' +
          'works from the same single token block, because a custom property resolves its ' +
          '`light-dark()` against the *using* element.',
      },
    },
  },
  render: () => html`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));gap:var(--ja-space-5)">
      ${['(no attribute — follows the OS)', 'light', 'dark']
        .map((label, index) => {
          const attribute = index === 0 ? '' : ` data-theme="${label}"`;
          return html`
            <div${attribute} style="background:var(--ja-body-bg);color:var(--ja-body-color);padding:var(--ja-space-4);border:var(--ja-border);border-radius:var(--ja-radius)">
              ${section(label, specimen)}
            </div>
          `;
        })
        .join('')}
    </div>
  `,
};
