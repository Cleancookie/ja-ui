import { writeFileSync } from 'node:fs';
import { COLORS, banner } from './palette.mjs';

let out = banner(
  'derived colour tokens',
  'Each variant state is mixed from its base colour, so overriding one\n   variable (e.g. --ja-primary) cascades through every component.'
);

out += ':root {\n';
for (const c of COLORS) {
  out += `  /* ${c} */
  --ja-${c}-hover: color-mix(in srgb, var(--ja-${c}) 86%, var(--ja-ink));
  --ja-${c}-active: color-mix(in srgb, var(--ja-${c}) 74%, var(--ja-ink));
  --ja-${c}-subtle: color-mix(in srgb, var(--ja-${c}) 18%, var(--ja-white));
  --ja-${c}-subtle-hover: color-mix(in srgb, var(--ja-${c}) 30%, var(--ja-white));
  --ja-${c}-border-subtle: var(--ja-border-color);
  --ja-${c}-emphasis: color-mix(in srgb, var(--ja-${c}) 55%, var(--ja-ink));
  --ja-${c}-ring: var(--ja-ring-color);

`;
}
out = `${out.trimEnd()}\n}\n`;

writeFileSync('src/styles/generated/theme-colors.css', out);
console.log('  generated/theme-colors.css');
