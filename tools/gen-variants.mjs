import { writeFileSync } from 'node:fs';
import { COLORS, banner } from './palette.mjs';

let out = banner(
  'colour variants',
  'One block per colour per component. Every rule only sets custom properties,\n   so component structure lives in src/styles/components/*.css.'
);

/* ------------------------------------------------------------------ buttons */
out += `/* --- Buttons: solid ------------------------------------------------------ */\n`;
for (const c of COLORS) {
  out += `.btn-${c} {
  --ja-btn-bg: var(--ja-${c});
  --ja-btn-color: var(--ja-${c}-fg);
  --ja-btn-border-color: var(--ja-border-color);
  --ja-btn-hover-bg: var(--ja-${c}-hover);
  --ja-btn-active-bg: var(--ja-${c}-active);
}

`;
}

out += `/* --- Buttons: outline ---------------------------------------------------- */\n`;
for (const c of COLORS) {
  out += `.btn-outline-${c} {
  --ja-btn-bg: transparent;
  --ja-btn-color: var(--ja-${c}-emphasis);
  --ja-btn-border-color: var(--ja-border-color);
  --ja-btn-hover-bg: var(--ja-${c});
  --ja-btn-hover-color: var(--ja-${c}-fg);
  --ja-btn-active-bg: var(--ja-${c}-active);
  --ja-btn-active-color: var(--ja-${c}-fg);
}

`;
}

out += `/* --- Buttons: soft (tinted fill) ----------------------------------------- */\n`;
for (const c of COLORS) {
  out += `.btn-soft-${c} {
  --ja-btn-bg: var(--ja-${c}-subtle);
  --ja-btn-color: var(--ja-${c}-emphasis);
  --ja-btn-border-color: var(--ja-border-color);
  --ja-btn-hover-bg: var(--ja-${c}-subtle-hover);
  --ja-btn-active-bg: var(--ja-${c});
  --ja-btn-active-color: var(--ja-${c}-fg);
}

`;
}

/* ------------------------------------------------------------------- badges */
out += `/* --- Badges -------------------------------------------------------------- */\n`;
for (const c of COLORS) {
  out += `.badge.bg-${c},
.badge.text-bg-${c} {
  --ja-badge-bg: var(--ja-${c});
  --ja-badge-color: var(--ja-${c}-fg);
}
.badge.bg-${c}-subtle {
  --ja-badge-bg: var(--ja-${c}-subtle);
  --ja-badge-color: var(--ja-${c}-emphasis);
}

`;
}

/* ------------------------------------------------------------------- alerts */
out += `/* --- Alerts -------------------------------------------------------------- */\n`;
for (const c of COLORS) {
  out += `.alert-${c} {
  --ja-alert-bg: var(--ja-${c}-subtle);
  --ja-alert-color: var(--ja-${c}-emphasis);
  --ja-alert-accent: var(--ja-${c});
}

`;
}

/* -------------------------------------------------------------------- cards */
out += `/* --- Cards --------------------------------------------------------------- */\n`;
for (const c of COLORS) {
  out += `.card.text-bg-${c} {
  --ja-card-bg: var(--ja-${c});
  --ja-card-color: var(--ja-${c}-fg);
}
.card.bg-${c}-subtle {
  --ja-card-bg: var(--ja-${c}-subtle);
  --ja-card-color: var(--ja-${c}-emphasis);
}
.card.shadow-${c} {
  --ja-shadow-color: var(--ja-${c});
}
.card > .card-header.bg-${c} {
  background-color: var(--ja-${c});
  color: var(--ja-${c}-fg);
}
.card > .card-header.bg-${c}-subtle {
  background-color: var(--ja-${c}-subtle);
  color: var(--ja-${c}-emphasis);
}

`;
}

/* -------------------------------------------------------------- list groups */
out += `/* --- List group ---------------------------------------------------------- */\n`;
for (const c of COLORS) {
  out += `.list-group-item-${c} {
  --ja-list-group-bg: var(--ja-${c}-subtle);
  --ja-list-group-color: var(--ja-${c}-emphasis);
}
.list-group-item-${c}.list-group-item-action:hover {
  --ja-list-group-bg: var(--ja-${c}-subtle-hover);
}

`;
}

/* ------------------------------------------------------------------- tables */
out += `/* --- Tables -------------------------------------------------------------- */\n`;
for (const c of COLORS) {
  out += `.table-${c} {
  --ja-table-color: var(--ja-${c}-emphasis);
  --ja-table-bg: var(--ja-${c}-subtle);
  --ja-table-striped-bg: color-mix(in srgb, var(--ja-${c}) 12%, transparent);
  --ja-table-hover-bg: color-mix(in srgb, var(--ja-${c}) 22%, transparent);
  --ja-table-head-bg: var(--ja-${c});
  --ja-table-head-color: var(--ja-${c}-fg);
}

`;
}

/* ----------------------------------------------------------------- progress */
out += `/* --- Progress ------------------------------------------------------------ */\n`;
for (const c of COLORS) {
  out += `.progress-bar.bg-${c},
.progress.bg-${c} > .progress-bar {
  --ja-progress-bar-bg: var(--ja-${c});
  --ja-progress-bar-color: var(--ja-${c}-fg);
}

`;
}

/* ------------------------------------------------------------------- navs */
out += `/* --- Nav / navbar / dropdown accents ------------------------------------ */\n`;
for (const c of COLORS) {
  out += `.nav-${c} {
  --ja-nav-active-bg: var(--ja-${c});
  --ja-nav-active-color: var(--ja-${c}-fg);
}
.navbar.bg-${c} {
  --ja-navbar-bg: var(--ja-${c});
  --ja-navbar-color: var(--ja-${c}-fg);
}
.toast.text-bg-${c} {
  --ja-toast-bg: var(--ja-${c});
  --ja-toast-color: var(--ja-${c}-fg);
}

`;
}

/* ------------------------------------------------------- colour utilities */
out += `/* --- Colour utilities ---------------------------------------------------- */\n`;
for (const c of COLORS) {
  out += `.text-${c} {
  --ja-text-opacity: 1;
  color: color-mix(in srgb, var(--ja-${c}) calc(var(--ja-text-opacity) * 100%), transparent) !important;
}
.text-${c}-emphasis {
  color: var(--ja-${c}-emphasis) !important;
}
.bg-${c} {
  --ja-bg-opacity: 1;
  background-color: color-mix(in srgb, var(--ja-${c}) calc(var(--ja-bg-opacity) * 100%), transparent) !important;
}
.bg-${c}-subtle {
  background-color: var(--ja-${c}-subtle) !important;
}
.text-bg-${c} {
  background-color: var(--ja-${c}) !important;
  color: var(--ja-${c}-fg) !important;
}
.border-${c} {
  border-color: var(--ja-${c}) !important;
}
.shadow-${c} {
  --ja-shadow-color: var(--ja-${c});
}
.link-${c} {
  color: var(--ja-${c}-emphasis) !important;
  text-decoration-color: color-mix(in srgb, var(--ja-${c}) 50%, transparent);
}
.link-${c}:hover,
.link-${c}:focus-visible {
  color: var(--ja-${c}) !important;
  text-decoration-color: currentcolor;
}
.link-underline-${c} {
  text-decoration-color: var(--ja-${c}) !important;
}
.fill-${c} {
  fill: var(--ja-${c}) !important;
}
.stroke-${c} {
  stroke: var(--ja-${c}) !important;
}

`;
}

writeFileSync('src/styles/generated/variants.css', out);
console.log('  generated/variants.css');
