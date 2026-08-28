/**
 * Assemble the GitHub Pages site into `docs/`, which is committed.
 *
 *   npm run site            build dist + Storybook, then assemble
 *   npm run site:serve      serve docs/ on http://localhost:6008
 *
 * Pages is set to "deploy from a branch: main /docs", so whatever is committed
 * here is what is live — run this and commit the result as part of any change
 * that should show up on the site.
 *
 * The layout is chosen so that nothing needs rewriting: the example pages ask
 * for `../dist/ja-ui.css`, and Storybook builds with relative URLs, so the
 * whole thing works from any base path — a project page under /<repo>/
 * included.
 *
 *   docs/index.html      the landing page (from site/)
 *   docs/dist/           the built library
 *   docs/examples/       the standalone template pages
 *   docs/images/         the README screenshots — SOURCE, not generated here
 *   docs/storybook/      the built Storybook
 *
 * Everything except `images/` is generated: `images/` is written by
 * `npm run shots` and is the one thing in here the build must never delete.
 */
import { createServer } from 'node:http';
import {
  cpSync,
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { extname, join, normalize } from 'node:path';

const OUT = 'docs';
const KEEP = new Set(['images']);
const PORT = 6008;

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

function build() {
  const missing = ['dist', 'storybook-static'].filter((dir) => !existsSync(dir));
  if (missing.length) {
    console.error(
      `\n  ${missing.join(' and ')} missing — run 'npm run build && npm run build-storybook' first.\n`
    );
    process.exit(1);
  }

  mkdirSync(OUT, { recursive: true });
  for (const entry of readdirSync(OUT)) {
    if (!KEEP.has(entry)) rmSync(join(OUT, entry), { recursive: true, force: true });
  }

  for (const [from, to] of [
    ['dist', 'dist'],
    ['examples', 'examples'],
    ['storybook-static', 'storybook'],
    ['site', '.'],
  ]) {
    cpSync(from, join(OUT, to), { recursive: true });
  }

  // The landing page borrows Storybook's favicon rather than shipping a second one.
  cpSync(join('storybook-static', 'favicon.svg'), join(OUT, 'favicon.svg'));
  // Stop Pages running the output through Jekyll, which eats underscore paths.
  writeFileSync(join(OUT, '.nojekyll'), '');

  const count = (dir) =>
    readdirSync(dir, { recursive: true }).filter((f) => statSync(join(dir, f)).isFile()).length;
  console.log(`  ${OUT}/ assembled — ${count(OUT)} files. Commit it to publish.`);
}

function serve() {
  if (!existsSync(join(OUT, 'index.html'))) {
    console.error(`\n  ${OUT}/index.html missing — run 'npm run site' first.\n`);
    process.exit(1);
  }
  createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    let path = join(OUT, normalize(url).replace(/^(\.\.[/\\])+/, ''));
    if (existsSync(path) && statSync(path).isDirectory()) path = join(path, 'index.html');
    if (!existsSync(path)) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
    createReadStream(path).pipe(res);
  }).listen(PORT, () => console.log(`  http://localhost:${PORT}`));
}

if (process.argv.includes('--serve')) serve();
else build();
