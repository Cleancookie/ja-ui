/**
 * Story helpers.
 *
 * The utility classes and the 12-column grid are gone, so these stories lay
 * themselves out the same way a consuming page has to: with their own CSS,
 * written from `--ja-*` tokens. Everything below is either a template-literal
 * tag, an id generator, or a small inline-style layout wrapper — never a class
 * the library would have to ship.
 */

/** Identity tag so editors syntax-highlight the template literals below. */
export const html = (strings, ...values) =>
  strings.reduce((out, chunk, i) => out + chunk + (values[i] ?? ''), '');

/**
 * A DOM id that is unique per render. Storybook's autodocs page renders the
 * primary story twice, so any story with hardcoded ids ends up with two copies
 * of them and every `commandfor`, `popovertarget`, `for` and `aria-controls`
 * retargets the first copy. Every id in these stories comes from here.
 */
let uidSeq = 0;
export const uid = (prefix) => `${prefix}-${(uidSeq += 1)}`;

/** The colour axis, in the order ARCHITECTURE.md lists it. */
export const COLORS = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'danger',
  'light',
  'dark',
  'pop',
  'fresh',
];

/** The treatment axis. Composes with any colour. */
export const TREATMENTS = ['outline', 'soft', 'ghost'];

/* ---------------------------------------------------------------------------
   Layout
   ---------------------------------------------------------------------------
   `d-flex`, `gap-3`, `row` and `col-6` no longer exist. A page owns its own
   layout, so a story does too — these are inline styles built from the space
   scale, and they are exactly what a consumer would write.
   ------------------------------------------------------------------------ */

/** A wrapping row of examples, vertically centred. */
export const row = (items, gap = 3) =>
  `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:var(--ja-space-${gap})">${items.join('')}</div>`;

/** A vertical stack. */
export const stack = (items, gap = 4) =>
  `<div style="display:flex;flex-direction:column;gap:var(--ja-space-${gap})">${items.join('')}</div>`;

/** An auto-filling grid — the replacement for `row`/`col-*`. */
export const grid = (items, min = '15rem', gap = 4) =>
  `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(${min},1fr));gap:var(--ja-space-${gap})">${items.join('')}</div>`;

/**
 * A labelled block. <section> is already a flex column with the flow gap, so
 * this only has to supply the caption — set in the library's own small-label
 * vocabulary, from tokens.
 */
export const section = (title, body) => `
  <section>
    <h2 style="font-size:var(--ja-font-size-sm);font-weight:var(--ja-label-weight);letter-spacing:var(--ja-label-tracking);text-transform:var(--ja-label-case);color:var(--ja-text-muted)">${title}</h2>
    ${body}
  </section>
`;

/** A quiet aside line. `.text-muted` is gone; the token is not. */
export const note = (text) =>
  `<p style="color:var(--ja-text-muted);max-inline-size:var(--ja-measure)">${text}</p>`;

/** Inline icon set — no icon dependency, just the few used in the demos. */
export const icon = (name, size = 16) => {
  const paths = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="m5 13 4 4L19 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9Z"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    warn: '<path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12h11L21 7H6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"/>',
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? ''}</svg>`;
};
