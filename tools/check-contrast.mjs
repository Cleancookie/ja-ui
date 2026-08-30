/**
 * Check every foreground/background token pair against WCAG AA, in both themes
 * and both skins.
 *
 * The library's promise is that you can prototype fast and ship the prototype
 * without stopping to think about accessibility. A token pair that fails
 * contrast breaks that promise everywhere at once and silently — every filled
 * primary button on every page — so it is checked mechanically.
 *
 * The colours are read out of a real browser rather than computed here, because
 * the tokens are built from light-dark() and color-mix() and only the engine
 * knows what they resolve to.
 *
 *   npm run build && npm run check:contrast
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { chromium } from 'playwright';

function findChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  const cache = join(homedir(), '.cache', 'ms-playwright');
  if (!existsSync(cache)) return undefined;
  const build = readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().pop();
  if (!build) return undefined;
  for (const candidate of ['chrome-linux64/chrome', 'chrome-linux/chrome']) {
    const path = join(cache, build, candidate);
    if (existsSync(path)) return path;
  }
  return undefined;
}

const COLOURS = ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark', 'pop', 'fresh'];

/** Button labels are 14px bold — under the 18.66px bold that counts as large. */
const TEXT = 4.5;
/** Focus rings and other non-text marks that carry meaning on their own. */
const NON_TEXT = 3;

/**
 * Real elements, not raw tokens. What matters is the contrast a reader actually
 * gets, and that is only visible once the variant classes have remapped the
 * tokens and the element has resolved its own background.
 *
 * Deliberately NOT checked: the contrast of a fill against the page behind it.
 * Every filled thing in this library carries a 2px ink border, so the boundary
 * is the border's job, not the fill's — and the resting borders in the dark
 * theme are quiet on purpose, because a loud-bordered dark theme is the
 * high-contrast look this one was written to replace.
 */
const CASES = [
  ...COLOURS.flatMap((name) => [
    { what: `<button class="${name}">`, html: `<button class="${name}">Save</button>`, min: TEXT },
    { what: `<button class="${name} outline">`, html: `<button class="${name} outline">Save</button>`, min: TEXT },
    { what: `<button class="${name} soft">`, html: `<button class="${name} soft">Save</button>`, min: TEXT },
    { what: `<span class="badge ${name}">`, html: `<span class="badge ${name}">7</span>`, min: TEXT },
    { what: `<div class="callout ${name}">`, html: `<div class="callout ${name}">Heads up</div>`, min: TEXT },
  ]),
  { what: '<button>', html: '<button>Cancel</button>', min: TEXT },
  { what: '<button class="ghost">', html: '<button class="ghost">Cancel</button>', min: TEXT },
  { what: 'body text', html: '<p>The quick brown fox</p>', min: TEXT },
  { what: 'a link', html: '<p><a href="#">a link</a></p>', min: TEXT },
  { what: 'muted text on a card', html: '<article><p><small>Secondary detail</small></p></article>', min: TEXT },
  { what: 'code', html: '<p><code>npm run build</code></p>', min: TEXT },
  { what: 'a table head', html: '<table><thead><tr><th>Name</th></tr></thead><tbody><tr><td>x</td></tr></tbody></table>', min: TEXT },
  { what: 'an input', html: '<label>Email <input type="email" value="you@example.com" /></label>', min: TEXT },
  { what: 'a summary', html: '<details open><summary>More</summary><p>body</p></details>', min: TEXT },
];

const browser = await chromium.launch({ executablePath: findChromium() });
const page = await browser.newPage();
await page.setContent(
  `<!doctype html><html><head><style>${readFileSync('dist/ja-ui.css', 'utf8')}</style></head><body><div id="probe"></div></body></html>`,
  { waitUntil: 'load' }
);

const failures = [];
let checked = 0;

for (const theme of ['light', 'dark']) {
  for (const skin of ['default', 'brutal']) {
    await page.evaluate(
      ([t, s]) => {
        document.documentElement.dataset.theme = t;
        if (s === 'brutal') document.documentElement.dataset.style = s;
        else delete document.documentElement.dataset.style;
      },
      [theme, skin]
    );

    const results = await page.evaluate(({ cases, nonText }) => {
      const probe = document.getElementById('probe');
      const channel = (value) => {
        const c = value / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      // color-mix(in oklab, …) computes to an oklab() string, not rgb(), so the
      // colour is converted through a canvas rather than parsed by hand — the
      // engine is the only thing that reliably knows what these resolve to.
      // getImageData is specified to return non-premultiplied channels, and
      // 'copy' makes the fill replace the pixel so the alpha survives.
      const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      ctx.globalCompositeOperation = 'copy';
      const parse = (css) => {
        ctx.fillStyle = '#000';
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return [r, g, b, a / 255];
      };
      const luminance = (rgb) =>
        0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);

      /** Composite a possibly-translucent colour over what is behind it. */
      const over = (top, bottom) => {
        const alpha = top[3] ?? 1;
        return [0, 1, 2].map((i) => top[i] * alpha + bottom[i] * (1 - alpha));
      };

      /** The colour actually behind this element, walking up through transparency. */
      const backdrop = (element) => {
        let stack = [];
        for (let node = element; node; node = node.parentElement) {
          const rgb = parse(getComputedStyle(node).backgroundColor);
          if ((rgb[3] ?? 1) > 0) stack.push(rgb);
          if ((rgb[3] ?? 1) === 1) break;
        }
        return stack.reduceRight((below, layer) => over(layer, below), [255, 255, 255]);
      };

      const ratio = (x, y) => {
        const [a, b] = [luminance(x), luminance(y)].sort((m, n) => n - m);
        return (a + 0.05) / (b + 0.05);
      };

      /** A token's resolved colour, read off a real element so light-dark() and
          color-mix() are resolved by the engine rather than parsed by hand. */
      const token = (name) => {
        probe.innerHTML = `<div style="background-color: var(${name})"></div>`;
        return parse(getComputedStyle(probe.firstElementChild).backgroundColor);
      };

      // The focus ring is not text and it has no element of its own — the reset
      // draws it from --ja-ring-color. It has to be legible against the page,
      // and it must not read as more shadow: every shadow in this library is a
      // hard zero-blur offset in --ja-shadow-color, so a ring that matches it
      // disappears into the corner of a focused input.
      const pageBg = backdrop(probe);
      const ring = over(token('--ja-ring-color'), pageBg);
      const shadow = over(token('--ja-shadow-color'), pageBg);
      const rings = [
        ['the focus ring on the page', pageBg],
        ['the focus ring vs the shadow', shadow],
      ].map(([what, against]) => ({
        what,
        min: nonText,
        ratio: ratio(ring, against),
        fg: `rgb(${ring.map(Math.round).join(' ')})`,
        bg: `rgb(${against.map(Math.round).join(' ')})`,
      }));

      return rings.concat(cases.map((testCase) => {
        probe.innerHTML = testCase.html;
        // The deepest element that actually holds text is the one to measure.
        const target =
          [...probe.querySelectorAll('*')].findLast(
            (element) => element.textContent.trim() && !element.children.length
          ) ?? probe.firstElementChild;
        const fg = over(parse(getComputedStyle(target).color), backdrop(target));
        const bg = backdrop(target);
        const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
        return {
          what: testCase.what,
          min: testCase.min,
          ratio: (a + 0.05) / (b + 0.05),
          fg: `rgb(${fg.map(Math.round).join(' ')})`,
          bg: `rgb(${bg.map(Math.round).join(' ')})`,
        };
      }));
    }, { cases: CASES, nonText: NON_TEXT });

    for (const result of results) {
      checked += 1;
      if (result.ratio < result.min) failures.push({ theme, skin, ...result });
    }
  }
}

await browser.close();

if (failures.length) {
  console.error('');
  for (const f of failures) {
    console.error(
      `  ✗ ${f.theme}/${f.skin}  ${f.what.padEnd(24)} ${f.ratio.toFixed(2)}:1 ` +
        `(needs ${f.min}:1)  ${f.fg} on ${f.bg}`
    );
  }
  console.error(`\n  ${failures.length} of ${checked} token pairs fail WCAG AA\n`);
  process.exit(1);
}

console.log(`  ✓ ${checked} token pairs pass WCAG AA in both themes and both skins`);
