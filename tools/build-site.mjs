/**
 * Assemble the GitHub Pages site into `docs/`, which is build output.
 *
 *   npm run site            build dist + Storybook, then assemble
 *   npm run site:serve      serve docs/ on http://localhost:6008
 *
 * `docs/` is gitignored and disposable — Pages is deployed by
 * `.github/workflows/pages.yml`, which runs this on every push to main and
 * uploads the result. Nothing here is committed.
 *
 * The layout is chosen so that nothing needs rewriting: the example pages ask
 * for `../dist/ja-ui.css`, and Storybook builds with relative URLs, so the
 * whole thing works from any base path — a project page under /<repo>/
 * included.
 *
 *   docs/index.html      the landing page (from site/)
 *   docs/images/         the screenshots (from site/images/ — SOURCE, committed)
 *   docs/dist/           the built library
 *   docs/examples/       the standalone template pages
 *   docs/storybook/      the built Storybook
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

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

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
  console.log(`  ${OUT}/ assembled — ${count(OUT)} files.`);
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
