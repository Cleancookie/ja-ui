/**
 * Cheap structural checks on the authored CSS. These catch the class of bug
 * that is invisible in review and silently drops a whole rule at parse time.
 *
 *   npm run lint:css
 */
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { globSync } from 'node:fs';

const files = globSync('src/styles/**/*.css');
const problems = [];

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const lines = source.split('\n');
  let inComment = false;

  lines.forEach((line, i) => {
    // A `*/` inside a comment — e.g. writing `.m-*/.gap-*` in prose — ends the
    // comment early and turns the rest of it into a broken selector, which
    // takes the following rule down with it.
    let rest = line;
    let column = 0;
    while (rest.length) {
      if (!inComment) {
        const open = rest.indexOf('/*');
        if (open === -1) break;
        inComment = true;
        column += open + 2;
        rest = rest.slice(open + 2);
      } else {
        const close = rest.indexOf('*/');
        if (close === -1) break;
        const after = rest.slice(close + 2).trim();
        // A legitimate close is followed by nothing, or by a new rule/comment.
        if (after && !after.startsWith('/*') && !/^[.#:@a-zA-Z[*]/.test(after) === false) {
          // fine — this is a real close followed by CSS
        }
        inComment = false;
        column += close + 2;
        rest = rest.slice(close + 2);
      }
    }

    // The specific trap: `*/` appearing mid-word inside comment prose.
    if (/\*\/[^\s]/.test(line) && /^\s*[^{}]*$/.test(line) && !line.includes('{')) {
      const looksLikeProse = /[a-z]{3,}\s/.test(line);
      if (looksLikeProse) {
        problems.push(
          `${relative('.', file)}:${i + 1}  a '*/' inside comment prose ends the comment early:\n      ${line.trim()}`
        );
      }
    }
  });

  if (inComment) {
    problems.push(`${relative('.', file)}  unterminated comment`);
  }
}

// The dark theme is written twice — once for the explicit attribute, once for
// the OS preference — and the two must not drift apart.
{
  const source = readFileSync('src/styles/base/tokens.css', 'utf8');
  const declarations = (block) =>
    block
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('--'))
      .join('\n');

  for (const [name, attribute, media] of [
    [
      'default',
      /\[data-ja-theme="dark"\] \{([\s\S]*?)\n\}/,
      /:root:not\(\[data-ja-theme="light"\]\) \{([\s\S]*?)\n  \}/,
    ],
    [
      'brutal',
      /\[data-ja-style="brutal"\]\[data-ja-theme="dark"\] \{([\s\S]*?)\n\}/,
      /:root\[data-ja-style="brutal"\]:not\(\[data-ja-theme="light"\]\) \{([\s\S]*?)\n  \}/,
    ],
  ]) {
    const a = source.match(attribute);
    const b = source.match(media);
    if (!a || !b) {
      problems.push(`src/styles/base/tokens.css  cannot find both ${name} dark blocks to compare`);
    } else if (declarations(a[1]) !== declarations(b[1])) {
      problems.push(
        `src/styles/base/tokens.css  the ${name} dark theme differs between [data-ja-theme="dark"] and the prefers-color-scheme block — they must declare the same tokens.`
      );
    }
  }
}

// The rule that the above bug actually destroyed — assert it survives a build.
try {
  const bundle = readFileSync('dist/ja-ui.css', 'utf8');
  if (!/^\*,\n\*::before,\n\*::after \{\n\s+box-sizing: border-box;/m.test(bundle)) {
    problems.push(
      "dist/ja-ui.css  the universal box-sizing rule is missing or malformed — something upstream broke CSS parsing."
    );
  }
} catch {
  console.log('  (dist not built — skipping bundle checks)');
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`  ${files.length} stylesheets look structurally sound`);
