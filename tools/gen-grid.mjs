import { writeFileSync } from 'node:fs';
import { BREAKPOINTS, infix, banner, media } from './palette.mjs';

const MAXW = { sm: '540px', md: '720px', lg: '960px', xl: '1140px', xxl: '1320px' };
const g = 'var(--ja-gutter-x)';
const span = (n, cols = 12) =>
  `calc((100% - ${cols - 1} * ${g}) * ${n} / ${cols} + ${n - 1} * ${g})`;
const rowCols = (n) => `calc((100% - ${n - 1} * ${g}) / ${n})`;
const GUTTERS = ['0', '0.25rem', '0.5rem', '1rem', '1.5rem', '3rem'];

let out = banner(
  'containers & grid',
  'A flexbox 12-column grid. Gutters are real `gap`, never negative margins,\n   so the grid cannot leak spacing into your layout.'
);

const containerNames = ['.container', '.container-fluid', ...Object.keys(MAXW).map((b) => `.container-${b}`)];
out += `${containerNames.join(',\n')} {
  inline-size: 100%;
  margin-inline: auto;
  padding-inline: var(--ja-container-padding-x);
}
`;

const order = BREAKPOINTS.map(([b]) => b);
for (const [bp, min] of BREAKPOINTS) {
  if (!bp) continue;
  const names = [
    '.container',
    ...Object.keys(MAXW)
      .filter((b) => order.indexOf(b) <= order.indexOf(bp))
      .map((b) => `.container-${b}`),
  ];
  out += `\n${media(min, `${names.join(',\n')} {\n  max-inline-size: ${MAXW[bp]};\n}\n`)}`;
}

out += `
.row {
  --ja-gutter-x: 1.5rem;
  --ja-gutter-y: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--ja-gutter-y) var(--ja-gutter-x);
}

.row > * {
  flex-shrink: 0;
  inline-size: 100%;
  max-inline-size: 100%;
}
`;

for (const [bp, min] of BREAKPOINTS) {
  const i = infix(bp);
  let body = `.col${i} {\n  flex: 1 0 0%;\n  inline-size: auto;\n}\n\n`;
  body += `.col${i}-auto {\n  flex: 0 0 auto;\n  inline-size: auto;\n}\n\n`;
  for (let n = 1; n <= 12; n++) {
    body += `.col${i}-${n} {\n  flex: 0 0 auto;\n  inline-size: ${span(n)};\n}\n\n`;
  }
  body += `.row-cols${i}-auto > * {\n  flex: 0 0 auto;\n  inline-size: auto;\n}\n\n`;
  for (let n = 1; n <= 6; n++) {
    body += `.row-cols${i}-${n} > * {\n  flex: 0 0 auto;\n  inline-size: ${rowCols(n)};\n}\n\n`;
  }
  body += `.offset${i}-0 {\n  margin-inline-start: 0;\n}\n\n`;
  for (let n = 1; n <= 11; n++) {
    body += `.offset${i}-${n} {\n  margin-inline-start: calc(${span(n)} + ${g});\n}\n\n`;
  }
  GUTTERS.forEach((v, n) => {
    body += `.g${i}-${n},\n.gx${i}-${n} {\n  --ja-gutter-x: ${v};\n}\n\n`;
    body += `.g${i}-${n},\n.gy${i}-${n} {\n  --ja-gutter-y: ${v};\n}\n\n`;
  });
  out += `\n${media(min, body)}`;
}

writeFileSync('src/styles/generated/grid.css', out);
console.log('  generated/grid.css');
