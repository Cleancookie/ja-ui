import { writeFileSync } from 'node:fs';
import { BREAKPOINTS, infix, banner, media } from './palette.mjs';

/* Bootstrap's 0-5 spacing scale, mapped onto ja-ui's space tokens, plus 6-8
   for page-level rhythm (section padding) which Bootstrap makes you hand-roll. */
const SPACERS = {
  0: '0',
  1: 'var(--ja-space-1)',
  2: 'var(--ja-space-2)',
  3: 'var(--ja-space-4)',
  4: 'var(--ja-space-5)',
  5: 'var(--ja-space-7)',
  6: 'var(--ja-space-8)',
  7: '6rem',
  8: '8rem',
};

const SIDES = {
  t: ['block-start'],
  b: ['block-end'],
  s: ['inline-start'],
  e: ['inline-end'],
  x: ['inline-start', 'inline-end'],
  y: ['block-start', 'block-end'],
  '': [''],
};

const rule = (sel, decls) => `${sel} {\n${decls.map((d) => `  ${d}`).join('\n')}\n}\n\n`;
const one = (sel, prop, val) => rule(sel, [`${prop}: ${val} !important;`]);

/* ---------------------------------------------------------- responsive set */
function responsive() {
  let all = '';
  for (const [bp, min] of BREAKPOINTS) {
    const i = infix(bp);
    let body = '';

    // display
    for (const d of ['none', 'inline', 'inline-block', 'block', 'grid', 'inline-grid', 'table', 'table-row', 'table-cell', 'flex', 'inline-flex']) {
      body += one(`.d${i}-${d}`, 'display', d);
    }

    // flex direction / wrap
    for (const [n, v] of [['row', 'row'], ['column', 'column'], ['row-reverse', 'row-reverse'], ['column-reverse', 'column-reverse']]) {
      body += one(`.flex${i}-${n}`, 'flex-direction', v);
    }
    for (const v of ['wrap', 'nowrap', 'wrap-reverse']) {
      body += one(`.flex${i}-${v}`, 'flex-wrap', v);
    }
    body += one(`.flex${i}-fill`, 'flex', '1 1 auto');
    for (const v of [0, 1]) {
      body += one(`.flex${i}-grow-${v}`, 'flex-grow', v);
      body += one(`.flex${i}-shrink-${v}`, 'flex-shrink', v);
    }

    // alignment
    const JUSTIFY = { start: 'flex-start', end: 'flex-end', center: 'center', between: 'space-between', around: 'space-around', evenly: 'space-evenly' };
    for (const [n, v] of Object.entries(JUSTIFY)) body += one(`.justify-content${i}-${n}`, 'justify-content', v);
    const ALIGN = { start: 'flex-start', end: 'flex-end', center: 'center', baseline: 'baseline', stretch: 'stretch' };
    for (const [n, v] of Object.entries(ALIGN)) {
      body += one(`.align-items${i}-${n}`, 'align-items', v);
      body += one(`.align-self${i}-${n}`, 'align-self', v);
    }
    const ACONTENT = { start: 'flex-start', end: 'flex-end', center: 'center', between: 'space-between', around: 'space-around', stretch: 'stretch' };
    for (const [n, v] of Object.entries(ACONTENT)) body += one(`.align-content${i}-${n}`, 'align-content', v);

    // order
    for (const n of [0, 1, 2, 3, 4, 5]) body += one(`.order${i}-${n}`, 'order', n);
    body += one(`.order${i}-first`, 'order', '-1');
    body += one(`.order${i}-last`, 'order', '6');

    // gap
    for (const [k, v] of Object.entries(SPACERS)) {
      body += one(`.gap${i}-${k}`, 'gap', v);
      body += one(`.row-gap${i}-${k}`, 'row-gap', v);
      body += one(`.column-gap${i}-${k}`, 'column-gap', v);
    }

    // margin & padding
    for (const [abbr, props] of Object.entries(SIDES)) {
      for (const [k, v] of Object.entries(SPACERS)) {
        const mDecls = props.map((p) => `margin${p ? `-${p}` : ''}: ${v} !important;`);
        const pDecls = props.map((p) => `padding${p ? `-${p}` : ''}: ${v} !important;`);
        body += rule(`.m${abbr}${i}-${k}`, mDecls);
        body += rule(`.p${abbr}${i}-${k}`, pDecls);
      }
      body += rule(`.m${abbr}${i}-auto`, props.map((p) => `margin${p ? `-${p}` : ''}: auto !important;`));
      // negative margins — for deliberate overlap
      for (const [k, v] of Object.entries(SPACERS)) {
        if (k === '0') continue;
        body += rule(`.m${abbr}${i}-n${k}`, props.map((p) => `margin${p ? `-${p}` : ''}: calc(${v} * -1) !important;`));
      }
    }

    // text alignment
    for (const [n, v] of [['start', 'start'], ['center', 'center'], ['end', 'end']]) {
      body += one(`.text${i}-${n}`, 'text-align', v);
    }

    all += media(min, body);
  }
  return all;
}

/* --------------------------------------------------------------- flat set */
function flat() {
  let body = '';

  // position
  for (const v of ['static', 'relative', 'absolute', 'fixed', 'sticky']) body += one(`.position-${v}`, 'position', v);
  for (const [n, prop] of [['top', 'inset-block-start'], ['bottom', 'inset-block-end'], ['start', 'inset-inline-start'], ['end', 'inset-inline-end']]) {
    for (const v of [0, 50, 100]) body += one(`.${n}-${v}`, prop, `${v}%`);
  }
  body += one('.inset-0', 'inset', '0');
  body += rule('.translate-middle', ['translate: -50% -50% !important;']);
  body += rule('.translate-middle-x', ['translate: -50% 0 !important;']);
  body += rule('.translate-middle-y', ['translate: 0 -50% !important;']);
  for (const v of [0, 1, 2, 3]) body += one(`.z-${v}`, 'z-index', v);
  body += one('.z-n1', 'z-index', '-1');

  // sizing
  for (const v of [25, 50, 75, 100]) {
    body += one(`.w-${v}`, 'inline-size', `${v}%`);
    body += one(`.h-${v}`, 'block-size', `${v}%`);
  }
  body += one('.w-auto', 'inline-size', 'auto');
  body += one('.h-auto', 'block-size', 'auto');
  body += one('.mw-100', 'max-inline-size', '100%');
  body += one('.mh-100', 'max-block-size', '100%');
  body += one('.vw-100', 'inline-size', '100vw');
  body += one('.vh-100', 'block-size', '100vh');
  body += one('.min-vh-100', 'min-block-size', '100vh');
  body += one('.min-vh-100-dvh', 'min-block-size', '100dvh');

  // borders
  body += rule('.border', ['border: var(--ja-border-width) solid var(--ja-border-color) !important;']);
  body += rule('.border-0', ['border: 0 !important;']);
  for (const [n, p] of [['top', 'block-start'], ['bottom', 'block-end'], ['start', 'inline-start'], ['end', 'inline-end']]) {
    body += rule(`.border-${n}`, [`border-${p}: var(--ja-border-width) solid var(--ja-border-color) !important;`]);
    body += rule(`.border-${n}-0`, [`border-${p}-width: 0 !important;`]);
  }
  for (const n of [1, 2, 3, 4, 5]) body += one(`.border-${n}`, 'border-width', `${n}px`);
  body += one('.border-dashed', 'border-style', 'dashed');
  body += one('.border-subtle', 'border-color', 'var(--ja-border-color-subtle)');

  // radius
  body += one('.rounded', 'border-radius', 'var(--ja-radius)');
  const RADII = { 0: '0', 1: 'var(--ja-radius-xs)', 2: 'var(--ja-radius-sm)', 3: 'var(--ja-radius)', 4: 'var(--ja-radius-lg)', 5: 'var(--ja-radius-xl)' };
  for (const [k, v] of Object.entries(RADII)) body += one(`.rounded-${k}`, 'border-radius', v);
  body += one('.rounded-circle', 'border-radius', '50%');
  body += one('.rounded-pill', 'border-radius', 'var(--ja-radius-pill)');
  body += one('.rounded-blob', 'border-radius', 'var(--ja-radius-blob)');
  for (const [n, corners] of [
    ['top', ['start-start', 'start-end']],
    ['bottom', ['end-start', 'end-end']],
    ['start', ['start-start', 'end-start']],
    ['end', ['start-end', 'end-end']],
  ]) {
    body += rule(`.rounded-${n}`, corners.map((c) => `border-${c}-radius: var(--ja-radius) !important;`));
    body += rule(`.rounded-${n}-0`, corners.map((c) => `border-${c}-radius: 0 !important;`));
  }

  // shadows
  body += one('.shadow-none', 'box-shadow', 'none');
  for (const [n, v] of [['xs', 'xs'], ['sm', 'sm'], ['lg', 'lg'], ['xl', 'xl'], ['2xl', '2xl']]) {
    body += one(`.shadow-${n}`, 'box-shadow', `var(--ja-shadow-${v})`);
  }
  body += one('.shadow', 'box-shadow', 'var(--ja-shadow)');

  // typography
  const FS = { 1: '2.5rem', 2: '2rem', 3: '1.75rem', 4: '1.5rem', 5: '1.25rem', 6: '1rem' };
  for (const [k, v] of Object.entries(FS)) body += one(`.fs-${k}`, 'font-size', v);
  body += one('.fs-sm', 'font-size', 'var(--ja-font-size-sm)');
  body += one('.fs-xs', 'font-size', 'var(--ja-font-size-xs)');
  const FW = { light: 300, normal: 'var(--ja-font-weight-normal)', medium: 'var(--ja-font-weight-medium)', semibold: 'var(--ja-font-weight-semibold)', bold: 'var(--ja-font-weight-bold)', black: 'var(--ja-font-weight-black)' };
  for (const [k, v] of Object.entries(FW)) body += one(`.fw-${k}`, 'font-weight', v);
  body += one('.fst-italic', 'font-style', 'italic');
  body += one('.fst-normal', 'font-style', 'normal');
  for (const [k, v] of [[1, 1], ['sm', 1.25], ['base', 'var(--ja-line-height)'], ['lg', 1.8]]) {
    body += one(`.lh-${k}`, 'line-height', v);
  }
  for (const v of ['lowercase', 'uppercase', 'capitalize', 'none']) body += one(`.text-${v}`, 'text-transform', v === 'none' ? 'none' : v);
  body += one('.text-decoration-none', 'text-decoration', 'none');
  body += one('.text-decoration-underline', 'text-decoration', 'underline');
  body += one('.text-decoration-line-through', 'text-decoration', 'line-through');
  body += one('.text-wrap', 'white-space', 'normal');
  body += one('.text-nowrap', 'white-space', 'nowrap');
  body += one('.text-balance', 'text-wrap', 'balance');
  body += one('.text-pretty', 'text-wrap', 'pretty');
  body += rule('.text-break', ['word-wrap: break-word !important;', 'word-break: break-word !important;']);
  body += one('.font-monospace', 'font-family', 'var(--ja-font-mono)');
  body += one('.font-heading', 'font-family', 'var(--ja-font-heading)');
  body += rule('.text-label', [
    'font-family: var(--ja-font-heading) !important;',
    'font-size: var(--ja-font-size-xs) !important;',
    'font-weight: var(--ja-label-weight) !important;',
    'letter-spacing: var(--ja-label-tracking) !important;',
    'text-transform: uppercase !important;',
  ]);
  body += one('.tracking-tight', 'letter-spacing', '-0.02em');
  body += one('.tracking-wide', 'letter-spacing', '0.08em');
  body += one('.tracking-widest', 'letter-spacing', '0.2em');
  body += one('.tabular-nums', 'font-variant-numeric', 'tabular-nums');

  // neutral colours
  body += one('.text-body', 'color', 'var(--ja-body-color)');
  body += one('.text-muted', 'color', 'var(--ja-text-muted)');
  body += one('.text-subtle', 'color', 'var(--ja-text-subtle)');
  body += one('.text-white', 'color', '#fff');
  body += one('.text-black', 'color', '#000');
  body += one('.text-ink', 'color', 'var(--ja-ink)');
  body += one('.text-reset', 'color', 'inherit');
  body += one('.bg-body', 'background-color', 'var(--ja-body-bg)');
  body += one('.bg-surface', 'background-color', 'var(--ja-surface)');
  body += one('.bg-sunken', 'background-color', 'var(--ja-surface-sunken)');
  body += one('.bg-white', 'background-color', 'var(--ja-white)');
  body += one('.bg-ink', 'background-color', 'var(--ja-ink)');
  body += one('.bg-cream', 'background-color', 'var(--ja-cream)');
  body += one('.bg-transparent', 'background-color', 'transparent');
  for (const v of [0, 25, 50, 75, 100]) {
    body += one(`.bg-opacity-${v}`, '--ja-bg-opacity', v / 100);
    body += one(`.text-opacity-${v}`, '--ja-text-opacity', v / 100);
    body += one(`.opacity-${v}`, 'opacity', v / 100);
  }

  // misc
  for (const v of ['auto', 'hidden', 'visible', 'scroll', 'clip']) {
    body += one(`.overflow-${v}`, 'overflow', v);
    body += one(`.overflow-x-${v}`, 'overflow-x', v);
    body += one(`.overflow-y-${v}`, 'overflow-y', v);
  }
  body += one('.pe-none', 'pointer-events', 'none');
  body += one('.pe-auto', 'pointer-events', 'auto');
  body += one('.user-select-none', 'user-select', 'none');
  body += one('.user-select-all', 'user-select', 'all');
  for (const v of ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom']) {
    body += one(`.align-${v}`, 'vertical-align', v);
  }
  for (const v of ['contain', 'cover', 'fill', 'scale-down', 'none']) {
    body += one(`.object-fit-${v}`, 'object-fit', v);
  }
  body += one('.visible', 'visibility', 'visible');
  body += one('.invisible', 'visibility', 'hidden');
  body += one('.cursor-pointer', 'cursor', 'pointer');
  body += one('.list-none', 'list-style', 'none');

  return body;
}

const out = `${banner(
  'utilities',
  'Bootstrap’s utility vocabulary, minus the parts that fight modern CSS\n   (no floats, no clearfix). Logical properties throughout, so RTL works.'
)}${flat()}${responsive()}`;

writeFileSync('src/styles/generated/utilities.css', out);
console.log('  generated/utilities.css');
