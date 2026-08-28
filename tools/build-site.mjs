/**
 * Assemble the GitHub Pages site into `_site`.
 *
 *   npm run site            build dist + Storybook, then assemble
 *   npm run site:serve      serve the assembled _site on http://localhost:6008
 *
 * The layout is chosen so that nothing needs rewriting: the example pages ask
 * for `../dist/ja-ui.css`, and Storybook builds with relative URLs, so the
 * whole thing works from any base path — a project page under
 * /<repo>/ included.
 *
 *   _site/index.html      the landing page (site/index.html)
 *   _site/dist/           the built library
 *   _site/examples/       the standalone template pages
 *   _site/images/         the README screenshots, reused on the landing page
 *   _site/storybook/      the built Storybook
 */
import { createServer } from 'node:http';
import {
  cpSync,
  createReadStream,
  existsSync,
  mkdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { extname, join, normalize } from 'node:path';

const OUT = '_site';
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
    ['docs/images', 'images'],
    ['storybook-static', 'storybook'],
    ['site', '.'],
  ]) {
    cpSync(from, join(OUT, to), { recursive: true });
  }

  // The landing page borrows Storybook's favicon rather than shipping a second one.
  cpSync(join('storybook-static', 'favicon.svg'), join(OUT, 'favicon.svg'));
  // Stop Pages running the output through Jekyll, which eats underscore paths.
  writeFileSync(join(OUT, '.nojekyll'), '');

  console.log(`  ${OUT}/ assembled — index, ${'examples'}, images and storybook/`);
}

function serve() {
  if (!existsSync(OUT)) {
    console.error(`\n  ${OUT} missing — run 'npm run site' first.\n`);
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
