/**
 * Load every example page in a real browser and prove it works.
 *
 * The example pages are the library's argument: plain semantic HTML, one
 * stylesheet, and it behaves. A page that renders but whose dialog never opens
 * is worse than no page, and neither the CSS lint nor the smoke test would
 * notice — so this drives each one the way a visitor would.
 *
 *   npm run build && npm run check:examples
 */
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';
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

const results = [];
const check = (page, name, pass, detail = '') => {
  results.push({ page, name, pass, detail });
  if (!pass) console.log(`    ✗ ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch({ executablePath: findChromium() });

for (const file of readdirSync('examples').filter((f) => f.endsWith('.html')).sort()) {
  console.log(`\n  ${file}`);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(pathToFileURL(resolve('examples', file)).href, { waitUntil: 'load' });
  await page.waitForTimeout(250);

  check(file, 'loads with no console or page errors', errors.length === 0, errors[0]);

  // The stylesheet actually applied — if the <link> 404s, the body keeps the
  // UA's white and every other assertion here would still pass.
  check(
    file,
    'the stylesheet applied',
    await page.evaluate(() => getComputedStyle(document.body).backgroundColor !== 'rgba(0, 0, 0, 0)'),
  );

  check(
    file,
    'the library booted',
    await page.evaluate(() => typeof window.JaUI?.toast === 'function'),
  );

  // No stale class API anywhere in the markup.
  const stale = await page.evaluate(() =>
    [...document.querySelectorAll('[class]')]
      .flatMap((element) => [...element.classList])
      .filter((name) =>
        /^(btn|card|modal|offcanvas|row|col|d-flex|form-control|form-label|nav-link|alert|text-muted|g-\d|p-\d|m[btsex]?-\d)/.test(name)
      )
  );
  check(file, 'no Bootstrap-era classes survive', stale.length === 0, stale.slice(0, 5).join(' '));

  // Every internal reference resolves.
  const dangling = await page.evaluate(() => {
    const bad = [];
    for (const attribute of ['commandfor', 'popovertarget', 'aria-controls', 'aria-labelledby', 'for']) {
      for (const element of document.querySelectorAll(`[${attribute}]`)) {
        if (element.tagName === 'LABEL' && attribute !== 'for') continue;
        for (const id of element.getAttribute(attribute).split(/\s+/).filter(Boolean)) {
          if (!document.getElementById(id)) bad.push(`${attribute}="${id}"`);
        }
      }
    }
    return bad;
  });
  check(file, 'every id reference resolves', dangling.length === 0, dangling.slice(0, 3).join(', '));

  const duplicates = await page.evaluate(() => {
    const seen = new Set();
    const dupes = new Set();
    for (const element of document.querySelectorAll('[id]')) {
      if (seen.has(element.id)) dupes.add(element.id);
      seen.add(element.id);
    }
    return [...dupes];
  });
  check(file, 'no duplicate ids', duplicates.length === 0, duplicates.slice(0, 3).join(', '));

  // Accessibility basics the library promises so the author never thinks about them.
  const unlabelled = await page.evaluate(() =>
    [...document.querySelectorAll('input:not([type=hidden]), select, textarea')].filter(
      (control) =>
        !control.closest('label') &&
        !control.getAttribute('aria-label') &&
        !control.getAttribute('aria-labelledby') &&
        !(control.id && document.querySelector(`label[for="${CSS.escape(control.id)}"]`))
    ).length
  );
  check(file, 'every form control is labelled', unlabelled === 0, `${unlabelled} unlabelled`);

  check(
    file,
    'exactly one <main> and a skip link',
    await page.evaluate(
      () => document.querySelectorAll('main').length === 1 && Boolean(document.querySelector('a.skip'))
    )
  );

  check(
    file,
    'every <nav> is uniquely labelled and none says "navigation"',
    await page.evaluate(() => {
      // A nav may be named by aria-label or by aria-labelledby pointing at a
      // real heading; both are correct, so resolve whichever is present.
      const labels = [...document.querySelectorAll('nav')].map((nav) => {
        const direct = nav.getAttribute('aria-label');
        if (direct) return direct.toLowerCase();
        const ref = nav.getAttribute('aria-labelledby');
        if (!ref) return '';
        return ref
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
          .join(' ')
          .toLowerCase();
      });
      return (
        labels.every((label) => label && !label.includes('navigation')) &&
        new Set(labels).size === labels.length
      );
    })
  );

  // Drive the interactive bits, where the page has them.
  if (await page.locator('[commandfor][command="show-modal"]').first().count()) {
    const trigger = page.locator('[commandfor][command="show-modal"]').first();
    const id = await trigger.getAttribute('commandfor');
    await trigger.click();
    await page.waitForTimeout(350);
    check(file, 'a dialog opens', await page.evaluate((i) => document.getElementById(i).open, id));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(350);
    check(file, 'Escape closes it', await page.evaluate((i) => !document.getElementById(i).open, id));
  }

  if (await page.locator('[popovertarget]').first().count()) {
    const trigger = page.locator('[popovertarget]').first();
    const id = await trigger.getAttribute('popovertarget');
    await trigger.click();
    await page.waitForTimeout(250);
    check(
      file,
      'a popover opens',
      await page.evaluate((i) => document.getElementById(i).matches(':popover-open'), id)
    );
    await page.keyboard.press('Escape');
  }

  if (await page.locator('details > summary').first().count()) {
    // Click the first summary and assert on ITS OWN <details> — the first
    // <details> on the page is not necessarily the one this summary opens.
    // Assert the toggle, not the end state — a page is entitled to ship its
    // first <details> already open, and then one click closes it.
    const toggled = await page.evaluate(async () => {
      const summary = document.querySelector('details > summary');
      const details = summary.parentElement;
      const before = details.open;
      summary.click();
      await new Promise((resolve) => setTimeout(resolve, 250));
      return details.open !== before;
    });
    check(file, 'details toggles', toggled);
  }

  if (await page.locator('[role="tab"]').count()) {
    const tabs = page.locator('[role="tab"]');
    await tabs.nth(1).click();
    await page.waitForTimeout(250);
    check(
      file,
      'tabs switch panels',
      await page.evaluate(() => {
        const tab = document.querySelectorAll('[role="tab"]')[1];
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        return tab.getAttribute('aria-selected') === 'true' && !panel.hidden;
      })
    );
  }

  // The theme toggle is on every page, and it is the one control that proves
  // the whole token layer is wired up.
  if (await page.locator('[data-ja-theme-toggle]').first().count()) {
    const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.locator('[data-ja-theme-toggle]').first().click();
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    check(file, 'the theme toggle repaints the page', before !== after, `${before} -> ${after}`);
  }

  // The navbar on a phone. Wrapped, brand + links + actions is three stacked
  // rows and `nav.sticky` keeps all three on screen for the whole scroll, so
  // below 576px the list takes a row of its own and scrolls instead of
  // wrapping. Last, because it resizes the viewport out from under the page.
  if (await page.locator('body > header > nav > :is(ul, ol, menu)').first().count()) {
    await page.setViewportSize({ width: 390, height: 780 });
    await page.waitForTimeout(250);
    const navbar = await page.evaluate(() => {
      const nav = document.querySelector('body > header > nav');
      const list = nav.querySelector(':scope > :is(ul, ol, menu)');
      const brand = nav.querySelector(':scope > :is(a, strong, span)');
      const box = list.getBoundingClientRect();
      const style = getComputedStyle(nav);
      const content =
        nav.clientWidth - parseFloat(style.paddingInlineStart) - parseFloat(style.paddingInlineEnd);
      const items = [...list.children].map((li) => li.getBoundingClientRect());
      return {
        // Row two: the whole content width, starting under the brand.
        ownRow: box.top >= brand.getBoundingClientRect().bottom && box.width >= content - 1,
        // One row of links, however many there are — not a wrapped block.
        oneRow: box.height <= Math.max(...items.map((i) => i.height)) + 16,
        scroller: getComputedStyle(list).overflowX === 'auto',
        // A phone is the touch case, so the targets do not shrink.
        target: Math.min(...items.map((i) => i.height)) >= 44,
        height: Math.round(nav.getBoundingClientRect().height),
      };
    });
    check(
      file,
      'the navbar is two rows on a phone, links on a scrolling strip',
      navbar.ownRow && navbar.oneRow && navbar.scroller && navbar.target,
      `${navbar.height}px — ${JSON.stringify(navbar)}`
    );
  }

  await page.close();
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n  ${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.log(`\n  failures:`);
  for (const f of failed) console.log(`    ${f.page}: ${f.name}${f.detail ? ` — ${f.detail}` : ''}`);
  process.exit(1);
}
