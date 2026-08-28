/** Identity tag so editors syntax-highlight the template literals below. */
export const html = (strings, ...values) =>
  strings.reduce((out, chunk, i) => out + chunk + (values[i] ?? ''), '');

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

/** Lay out a row of examples with consistent spacing. */
export const row = (items, gap = 3) =>
  `<div class="d-flex flex-wrap align-items-center gap-${gap}">${items.join('')}</div>`;

export const stack = (items, gap = 3) =>
  `<div class="d-flex flex-column gap-${gap}">${items.join('')}</div>`;

/** A labelled block, for stories that show several related things. */
export const section = (title, body) => `
  <section class="d-flex flex-column gap-3">
    <h3 class="text-label text-muted">${title}</h3>
    ${body}
  </section>
`;

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
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? ''}</svg>`;
};
