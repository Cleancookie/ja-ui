/**
 * Lint the stylesheet against the rules in ARCHITECTURE.md.
 *
 * These are the four rules that are easy to break by accident and impossible to
 * see in a screenshot, so they are checked mechanically rather than trusted:
 *
 *   1. No `!important`. It inverts cascade-layer order, so ours would start
 *      beating the consumer's own stylesheet — the exact thing layers exist to
 *      prevent.
 *   2. No physical properties. Logical ones only, so the library works in a
 *      right-to-left or vertical writing mode.
 *   3. Every rule lives in a layer. An unlayered rule beats every layered one,
 *      including the consumer's.
 *   4. No token used that is never defined and has no fallback — a silent
 *      no-op that renders as "nothing happened".
 *
 *   npm run lint:css
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src/styles';

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.css') ? [path] : [];
  });

/** Blank out comments so their prose never trips a check. */
const decomment = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '));

const PHYSICAL =
  /(^|[;{\s])(width|height|min-width|min-height|max-width|max-height|left|right|top|bottom|margin-(?:left|right|top|bottom)|padding-(?:left|right|top|bottom)|border-(?:left|right|top|bottom)(?:-(?:width|style|color))?)\s*:/;

const files = walk(ROOT);
const problems = [];
const defined = new Set(['--ja-accent', '--ja-accent-fg']); // supplied by the variant classes
const used = [];

for (const file of files) {
  const source = decomment(readFileSync(file, 'utf8'));
  const lines = source.split('\n');

  if (!/@layer\s+ja\./.test(source) && !file.endsWith('index.css')) {
    problems.push(`${file}: no @layer — unlayered rules beat every layered one`);
  }

  for (const [index, line] of lines.entries()) {
    const at = `${file}:${index + 1}`;
    if (line.includes('!important')) problems.push(`${at}: !important`);
    const physical = line.match(PHYSICAL);
    if (physical) problems.push(`${at}: physical property '${physical[2]}' — use the logical form`);

    for (const [, name] of line.matchAll(/(--ja-[\w-]+)\s*:/g)) defined.add(name);
    for (const match of line.matchAll(/var\(\s*(--ja-[\w-]+)\s*([,)])/g)) {
      used.push({ at, name: match[1], hasFallback: match[2] === ',' });
    }
  }
}

for (const { at, name, hasFallback } of used) {
  if (!defined.has(name) && !hasFallback) {
    problems.push(`${at}: ${name} is never defined and has no fallback`);
  }
}

if (problems.length) {
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  console.error(`\n${problems.length} problem${problems.length === 1 ? '' : 's'}`);
  process.exit(1);
}

console.log(`  ✓ ${files.length} stylesheets — layered, logical, no !important, no dangling tokens`);
