/**
 * Smoke test: drive every interactive component in a real browser and assert
 * the visible outcome. Not a unit-test suite — a "does the JS actually work"
 * gate to run before publishing.
 *
 *   npm run build && npm run smoke
 */
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const CSS = readFileSync('dist/ja-ui.css', 'utf8');
const JS = readFileSync('dist/ja-ui.iife.js', 'utf8');

function findChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  const cache = join(homedir(), '.cache', 'ms-playwright');
  if (!existsSync(cache)) return undefined;
  const build = readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().pop();
  if (!build) return undefined;
  for (const c of ['chrome-linux64/chrome', 'chrome-linux/chrome']) {
    const p = join(cache, build, c);
    if (existsSync(p)) return p;
  }
  return undefined;
}

const PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<style>${CSS}</style></head><body>
  <!-- Modal: a plain <dialog>, opened by a plain invoker button. No classes. -->
  <button id="dlg-open" commandfor="dlg" command="show-modal">Open</button>
  <dialog id="dlg">
    <header><h2>Title</h2></header>
    <div id="dlg-body"><input id="dlg-input" style="inline-size: 100%" autofocus /></div>
    <footer><button id="dlg-close" commandfor="dlg" command="close">Close</button></footer>
  </dialog>

  <!-- Drawer: the same element, pinned to an edge by one class. -->
  <button id="drawer-open" commandfor="drawer" command="show-modal">Drawer</button>
  <dialog id="drawer" class="drawer end">
    <button id="drawer-close" commandfor="drawer" command="close">Close</button>
  </dialog>

  <!-- Dropdown: the popover API. -->
  <button id="pop-open" popovertarget="pop">Menu</button>
  <menu id="pop" popover><li><button id="pop-item">One</button></li></menu>

  <!-- Accordion: <details>, which needs no JavaScript whatsoever. -->
  <details id="det"><summary id="det-summary">More</summary><p id="det-body">Region</p></details>

  <!-- Tabs: the one pattern with no native element. -->
  <div role="tablist" aria-label="Sections">
    <button role="tab" id="tab1" aria-selected="true" aria-controls="p1" tabindex="0">1</button>
    <button role="tab" id="tab2" aria-selected="false" aria-controls="p2" tabindex="-1">2</button>
  </div>
  <div id="p1" role="tabpanel" tabindex="0" aria-labelledby="tab1">Pane one</div>
  <div id="p2" role="tabpanel" tabindex="0" aria-labelledby="tab2" hidden>Pane two</div>

  <!-- Switch: no JavaScript at all, but its thumb is a ::before, which has no
       box in the DOM — only the pixels can say where it actually landed. The
       inline-block padding gives the screenshot clean background either side of
       the track to sample. -->
  <div id="sw-off-box" style="display: inline-block; padding: 20px">
    <input type="checkbox" role="switch" id="sw-off" />
  </div>
  <div id="sw-on-box" style="display: inline-block; padding: 20px">
    <input type="checkbox" role="switch" id="sw-on" checked />
  </div>

  <!-- Badge in a tight flex row: the row is far narrower than its contents, so
       a badge that is allowed to shrink is squeezed down to --ja-space-5 and
       its text spills over the inline padding. -->
  <ul role="list" class="list" id="badge-row" style="inline-size: 220px">
    <li><a href="#">
      <span><strong>A headline long enough to fight for the room</strong></span>
      <span class="badge success" id="badge">Published</span>
    </a></li>
  </ul>

  <!-- Pagination: no JavaScript, but the current-page chip is a cascade fight
       — the generic :hover rule used to out-specify the accent fill. -->
  <nav class="pagination" aria-label="Pagination">
    <ul>
      <li><a href="#" id="pg-current" aria-current="page">1</a></li>
      <li><a href="#" id="pg-other">2</a></li>
    </ul>
  </nav>

  <div class="command-palette" id="cp"></div>
  <div id="dt" style="inline-size: 880px"></div>
<script>${JS}</script></body></html>`;

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? '  ✓' : '  ✗'} ${name}${detail && !pass ? ` — ${detail}` : ''}`);
};

/**
 * A bundler is allowed to drop a side-effect-only import from a package whose
 * `sideEffects` field says there are none — which would silently delete the
 * autoInit() boot and leave every data-attribute component dead in any app
 * built with Vite, webpack or Rollup. Prove the boot survives a real bundle.
 */
function checkSideEffectImportSurvives() {
  const dir = mkdtempSync(join(tmpdir(), 'ja-ui-sideeffects-'));
  try {
    const entry = join(dir, 'consumer.js');
    writeFileSync(entry, `import '${resolve('src/index.js')}';\n`);
    const bundle = execFileSync(
      join('node_modules', '.bin', 'esbuild'),
      [entry, '--bundle', '--format=esm', '--target=es2022'],
      { encoding: 'utf8' }
    );
    check(
      'a side-effect-only import still boots the data attributes',
      bundle.includes('data-ja-no-autoinit'),
      "the autoInit boot was tree-shaken — check package.json's sideEffects field"
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function main() {
  checkSideEffectImportSurvives();

  const browser = await chromium.launch({ executablePath: findChromium() });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.setContent(PAGE, { waitUntil: 'load' });

  // Dialog — the modal is just <dialog> -----------------------------------
  await page.click('#dlg-open');
  await page.waitForTimeout(300);
  check('a command button opens the dialog', await page.evaluate(() => document.querySelector('#dlg').open));
  check('the dialog is modal, so it gets a ::backdrop', await page.evaluate(() => document.querySelector('#dlg').matches(':modal')));
  check('opening a modal locks the page scroll', await page.evaluate(() => getComputedStyle(document.documentElement).overflow === 'hidden'));
  check('autofocus moves focus inside', await page.evaluate(() => document.activeElement?.id === 'dlg-input'));
  // The body between the header and the footer scrolls, and a scroll container
  // clips at its padding box — so a control sitting flush against it loses the
  // outer half of its focus ring. The region has to carry that room itself.
  const ringRoom = await page.evaluate(() => {
    const region = document.querySelector('#dlg-body');
    const input = document.querySelector('#dlg-input');
    const root = getComputedStyle(document.documentElement);
    const space =
      parseFloat(root.getPropertyValue('--ja-ring-width')) +
      parseFloat(root.getPropertyValue('--ja-ring-offset'));
    const r = region.getBoundingClientRect();
    const i = input.getBoundingClientRect();
    return {
      space,
      scrolls: getComputedStyle(region).overflow,
      room: [i.left - r.left, r.right - i.right, i.top - r.top, r.bottom - i.bottom],
    };
  });
  check(
    'the dialog body leaves room for a focused control\'s ring',
    ringRoom.scrolls === 'auto' && ringRoom.room.every((gap) => gap >= ringRoom.space - 0.5),
    `${ringRoom.space}px of ring, ${ringRoom.room.join('/')} of room`
  );
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  check('Escape closes the dialog', await page.evaluate(() => !document.querySelector('#dlg').open));
  check('the scroll lock is released', await page.evaluate(() => getComputedStyle(document.documentElement).overflow !== 'hidden'));

  await page.click('#dlg-open');
  await page.waitForTimeout(250);
  // Grab the box while it is open, then again one frame into the exit. The
  // dialog is still on screen during the fade — allow-discrete holds `display`
  // — so any layout property left on dialog[open] is torn off a visible
  // element and it reflows into a different box, which reads as a second modal
  // flashing up. Only the scale may differ.
  const openBox = await page.evaluate(() => {
    const b = document.querySelector('#dlg').getBoundingClientRect();
    return { w: b.width, h: b.height };
  });
  await page.click('#dlg-close');
  await page.waitForTimeout(30);
  const exitBox = await page.evaluate(() => {
    const b = document.querySelector('#dlg').getBoundingClientRect();
    return { w: b.width, h: b.height };
  });
  // 0.96 is the exit scale; allow a frame of easing either side of it.
  const shapeRatio = (a, b) => (b === 0 ? 0 : a / b);
  check(
    'the dialog keeps its shape while it fades out',
    shapeRatio(exitBox.w, openBox.w) > 0.94 && shapeRatio(exitBox.h, openBox.h) > 0.94,
    `${openBox.w}x${openBox.h} became ${exitBox.w}x${exitBox.h}`
  );
  await page.waitForTimeout(400);
  check('a close command button closes the dialog', await page.evaluate(() => !document.querySelector('#dlg').open));

  // Drawer — the same element, one class ------------------------------------
  await page.click('#drawer-open');
  await page.waitForTimeout(400);
  check('the drawer opens', await page.evaluate(() => document.querySelector('#drawer').open));
  check('the drawer is pinned to an edge, not centred', await page.evaluate(() => {
    const box = document.querySelector('#drawer').getBoundingClientRect();
    return Math.abs(box.right - window.innerWidth) < 2;
  }));
  await page.click('#drawer-close');
  await page.waitForTimeout(400);
  check('the drawer closes', await page.evaluate(() => !document.querySelector('#drawer').open));

  // Popover — the dropdown --------------------------------------------------
  await page.click('#pop-open');
  await page.waitForTimeout(200);
  check('the popover opens', await page.evaluate(() => document.querySelector('#pop').matches(':popover-open')));
  // Open is not the same as visible. Where anchor positioning is supported the
  // menu sits under its trigger; a stray inset left over from the static
  // fallback parks it on the far edge of the anchor area, off the bottom of the
  // viewport — open, painted, and nowhere the user will ever see it.
  check('the popover lands under its trigger, inside the viewport', await page.evaluate(() => {
    const box = document.querySelector('#pop').getBoundingClientRect();
    const trigger = document.querySelector('#pop-open').getBoundingClientRect();
    return box.top >= trigger.bottom - 2 && box.bottom <= window.innerHeight + 1;
  }));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  check('Escape light-dismisses the popover', await page.evaluate(() => !document.querySelector('#pop').matches(':popover-open')));
  await page.click('#pop-open');
  await page.waitForTimeout(150);
  await page.mouse.click(880, 680);
  await page.waitForTimeout(200);
  check('an outside click light-dismisses the popover', await page.evaluate(() => !document.querySelector('#pop').matches(':popover-open')));

  // Details — zero JavaScript ----------------------------------------------
  check('details starts closed', !(await page.isVisible('#det-body')));
  await page.click('#det-summary');
  await page.waitForTimeout(400);
  check('details opens with no JavaScript at all', await page.isVisible('#det-body'));
  check('the summary is a real touch target', await page.evaluate(() => document.querySelector('#det-summary').getBoundingClientRect().height >= 44));
  await page.click('#det-summary');
  await page.waitForTimeout(400);
  check('details closes again', !(await page.isVisible('#det-body')));

  // Tabs — the APG keyboard model ------------------------------------------
  await page.click('#tab2');
  await page.waitForTimeout(200);
  check('clicking a tab reveals its panel', await page.isVisible('#p2'));
  check('the previous panel is hidden', !(await page.isVisible('#p1')));
  check('aria-selected follows the tab', (await page.getAttribute('#tab2', 'aria-selected')) === 'true');
  check('the roving tabindex moves with it', await page.evaluate(() =>
    document.querySelector('#tab2').tabIndex === 0 && document.querySelector('#tab1').tabIndex === -1));
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
  check('ArrowRight wraps to the first tab', (await page.getAttribute('#tab1', 'aria-selected')) === 'true');
  await page.keyboard.press('End');
  await page.waitForTimeout(150);
  check('End jumps to the last tab', (await page.getAttribute('#tab2', 'aria-selected')) === 'true');
  // A tab must not come out as a button. controls.css out-specifies a bare
  // [role="tab"], so the tab styling is a remap of the button's own tokens —
  // if that regresses, the tabs render as a row of pill-shaped, shadowed,
  // bordered buttons. --ja-btn-radius-base is a pill (9999px), so anything
  // over half the tab's height means the remap stopped reaching the page.
  const tabSkin = await page.evaluate(() => {
    const style = getComputedStyle(document.querySelector('#tab1'));
    const selected = getComputedStyle(document.querySelector('#tab2'));
    return {
      radius: parseFloat(style.borderTopLeftRadius),
      height: document.querySelector('#tab1').getBoundingClientRect().height,
      shadow: style.boxShadow,
      background: style.backgroundColor,
      bar: selected.borderBlockEndColor,
      idleBar: style.borderBlockEndColor
    };
  });
  check(
    'an unselected tab is flat and square-shouldered, not a button pill',
    tabSkin.radius < tabSkin.height / 2 && tabSkin.shadow === 'none',
    `radius ${tabSkin.radius} on a ${tabSkin.height}px tab, shadow ${tabSkin.shadow}`
  );
  check(
    'an unselected tab has no fill and no bar',
    /rgba\(0, 0, 0, 0\)|transparent/.test(tabSkin.background) &&
      /rgba\(0, 0, 0, 0\)|transparent/.test(tabSkin.idleBar),
    `background ${tabSkin.background}, bar ${tabSkin.idleBar}`
  );
  check(
    'the selected tab is underlined with the accent',
    !/rgba\(0, 0, 0, 0\)|transparent/.test(tabSkin.bar),
    `bar ${tabSkin.bar}`
  );

  // Toasts ------------------------------------------------------------------
  await page.evaluate(() => window.JaUI.toast('Saved.', { duration: 500 }));
  await page.waitForTimeout(200);
  check('a toast appears', (await page.locator('.toasts .toast').count()) === 1);
  check('the toast region is a manual popover', await page.evaluate(() =>
    document.querySelector('.toasts')?.getAttribute('popover') === 'manual'));
  check('the toast is polite, not assertive', await page.evaluate(() =>
    document.querySelector('.toasts .toast')?.getAttribute('role') === 'status'));
  await page.waitForTimeout(1200);
  check('the toast dismisses itself', (await page.locator('.toasts .toast').count()) === 0);

  // The region is hidden once it empties, so a second toast has to put it back
  // in the top layer. Appending into a closed popover is the failure that looks
  // like "the toast only ever fires once".
  check('the emptied region hides itself', await page.evaluate(() =>
    !document.querySelector('.toasts').matches(':popover-open')));
  await page.evaluate(() => window.JaUI.toast('Again.', { duration: 500 }));
  await page.waitForTimeout(200);
  check('a second toast re-opens the region', await page.evaluate(() =>
    document.querySelector('.toasts').matches(':popover-open')));
  check('the second toast is actually rendered', await page.evaluate(() => {
    const t = document.querySelector('.toasts .toast');
    return !!t && t.getBoundingClientRect().height > 0;
  }));
  await page.waitForTimeout(1200);

  // Command palette --------------------------------------------------------
  await page.evaluate(() => {
    window.picked = null;
    window.palette = new window.JaUI.CommandPalette('#cp', {
      items: [
        { label: 'Deploy to staging', group: 'Actions' },
        { label: 'Deploy to production', group: 'Actions', disabled: true },
        { label: 'User settings', description: 'Theme and shortcuts', group: 'Settings' },
        ...Array.from({ length: 5000 }, (_, i) => ({ label: `Record ${i}`, group: 'Data' })),
      ],
      onSelect: (item) => {
        window.picked = item.label;
      },
    });
  });
  await page.mouse.move(450, 300); // park the cursor over the list before it opens
  await page.evaluate(() => window.palette.show());
  await page.waitForTimeout(350);
  check('palette opens', await page.isVisible('#cp .command-palette-dialog'));
  check('palette focuses its input', await page.evaluate(() => document.activeElement?.classList.contains('command-palette-input')));
  check(
    'palette virtualises a 5,000-row list',
    await page.evaluate(() => {
      const rows = document.querySelectorAll('#cp .command-palette-item:not([hidden])').length;
      return rows > 0 && rows < 40;
    })
  );
  check('a resting pointer does not steal the selection', await page.evaluate(() => window.palette.activeItem?.label === 'Deploy to staging'));
  await page.keyboard.press('ArrowDown');
  check('arrow keys skip disabled rows', await page.evaluate(() => window.palette.activeItem?.label === 'User settings'));
  await page.keyboard.press('Control+k');
  check('ctrl-K moves back up', await page.evaluate(() => window.palette.activeItem?.label === 'Deploy to staging'));
  await page.fill('#cp .command-palette-input', 'usr set');
  await page.waitForTimeout(80);
  check('fuzzy search matches across gaps', await page.evaluate(() => window.palette.activeItem?.label === 'User settings'));
  check('matched characters are marked', (await page.locator('#cp .command-palette-item.is-active mark').count()) > 0);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(350);
  check('Enter runs the highlighted item', await page.evaluate(() => window.picked === 'User settings'));
  check('palette closes after a selection', !(await page.isVisible('#cp .command-palette-dialog')));

  // Data table -------------------------------------------------------------
  await page.evaluate(() => {
    window.dataTable = new window.JaUI.DataTable('#dt', {
      columnCount: 1000,
      rowCount: 1000000,
      defaultColumnWidth: 160,
      maxAutoWidth: 280,
      autoSizeSample: 32,
      getColumnLabel: (index) => `Field ${index + 1}`,
      getCell: (rowIndex, columnIndex) =>
        columnIndex === 3 && rowIndex === 20
          ? '{"kind":"blob","payload":"this long string should clamp before it gets silly wide"}'
          : `R${rowIndex + 1}C${columnIndex + 1}`,
    });
  });
  await page.waitForTimeout(150);
  check(
    'data table virtualises a million-by-thousand sheet',
    await page.evaluate(() => {
      const cells = document.querySelectorAll('#dt .datatable-cell:not([hidden])').length;
      const headers = document.querySelectorAll('#dt .datatable-header-cell:not([hidden])').length;
      return cells > 0 && cells < 800 && headers > 0 && headers < 20;
    })
  );
  await page.click('#dt .datatable-corner');
  check('data table selects the whole sheet from the corner gutter', await page.evaluate(() => window.dataTable.selectedAll));
  const widthBefore = await page.evaluate(() => window.dataTable._columnWidths[3]);
  await page.dblclick('#dt .datatable-header-cell[data-col="3"] .datatable-resize-handle');
  await page.waitForTimeout(80);
  check(
    'double-click auto-sizes a column but respects the cap',
    await page.evaluate((before) => {
      const after = window.dataTable._columnWidths[3];
      return after > before && after <= 280;
    }, widthBefore)
  );
  const widthDragBefore = await page.evaluate(() => window.dataTable._columnWidths[1]);
  await page.evaluate(() => {
    const handle = document.querySelector('#dt .datatable-header-cell[data-col="1"] .datatable-resize-handle');
    handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 200 }));
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 264 }));
    window.dispatchEvent(new PointerEvent('pointerup', { clientX: 264 }));
  });
  await page.waitForTimeout(80);
  check(
    'dragging a header edge resizes the column',
    await page.evaluate((before) => window.dataTable._columnWidths[1] > before, widthDragBefore)
  );
  await page.dblclick('#dt .datatable-corner .datatable-resize-handle');
  await page.waitForTimeout(100);
  check(
    'double-clicking the selected corner edge auto-sizes every column',
    await page.evaluate(() => window.dataTable._columnWidths[0] !== 160 && window.dataTable._columnWidths[3] <= 280)
  );
  await page.evaluate(() => {
    const viewport = document.querySelector('#dt .datatable-viewport');
    viewport.scrollTop = window.dataTable._headerHeight + 500000 * window.dataTable._rowHeight;
    viewport.scrollLeft = window.dataTable._gutterWidth + window.dataTable._columnOffsets[400];
    viewport.dispatchEvent(new Event('scroll'));
  });
  await page.waitForTimeout(150);
  check(
    'data table keeps rendering after deep scrolling',
    await page.evaluate(() => {
      const any = document.querySelector('#dt .datatable-cell[data-row="500000"][data-col="400"]');
      return Boolean(any?.textContent?.includes('R500001C401'));
    })
  );

  // The switch — geometry, so it is asserted in pixels ---------------------
  // The thumb is a ::before: getBoundingClientRect cannot see it and computed
  // styles report its size but never its position, so a thumb that is centred
  // in its track (or translated clean off the end of it) is invisible to every
  // DOM-level assertion. Sample the rendered row of pixels through the middle
  // of the track instead. The two failures this pins down are the ones the
  // shared `place-content: center` on the checkbox rule used to cause.
  const scanSwitch = async (boxId, trackId) => {
    // Where the track sits inside the wrapper's own screenshot, measured rather
    // than assumed — inline whitespace around the input shifts it.
    const track = await page.evaluate(
      ([box, id]) => {
        const outer = document.getElementById(box).getBoundingClientRect();
        const inner = document.getElementById(id).getBoundingClientRect();
        return { offset: inner.x - outer.x, width: inner.width };
      },
      [boxId, trackId]
    );
    const png = PNG.sync.read(await page.locator(`#${boxId}`).screenshot());
    const at = (x) => {
      const i = (png.width * (png.height >> 1) + Math.round(x)) << 2;
      return `${png.data[i]},${png.data[i + 1]},${png.data[i + 2]}`;
    };
    return {
      justOutsideStart: at(track.offset - 4),
      justOutsideEnd: at(track.offset + track.width + 4),
      insideStart: at(track.offset + 6),
      insideEnd: at(track.offset + track.width - 7),
    };
  };

  const swOff = await scanSwitch('sw-off-box', 'sw-off');
  const swOn = await scanSwitch('sw-on-box', 'sw-on');
  check(
    'an unchecked switch parks its thumb at the inline-start, not the middle',
    swOff.insideStart !== swOff.insideEnd,
    `both ends of the track are ${swOff.insideStart} — the thumb is centred`
  );
  check(
    'a checked switch parks its thumb at the inline-end',
    swOn.insideEnd !== swOn.insideStart,
    `both ends of the track are ${swOn.insideEnd} — the thumb is centred`
  );
  for (const [state, scan] of [['unchecked', swOff], ['checked', swOn]]) {
    // Both samples sit outside the track's border box, so both must be plain
    // page background. A thumb that has been translated past the end paints one
    // of them and the pair stops matching.
    check(
      `the ${state} switch keeps its thumb inside the track`,
      scan.justOutsideEnd === scan.justOutsideStart,
      `past the end of the track is ${scan.justOutsideEnd}, but before its start is ${scan.justOutsideStart}`
    );
  }

  // The badge — geometry again -------------------------------------------
  // `min-inline-size` replaces the automatic minimum size a flex item gets, so
  // a badge in a tight row shrinks below its text, and since the text never
  // wraps it spills straight over the inline padding.
  check(
    'a badge in a tight flex row keeps its inline padding',
    await page.evaluate(() => {
      const badge = document.getElementById('badge');
      const style = getComputedStyle(badge);
      const padding = parseFloat(style.paddingInlineStart) + parseFloat(style.paddingInlineEnd);
      const border = parseFloat(style.borderInlineStartWidth) + parseFloat(style.borderInlineEndWidth);
      const range = document.createRange();
      range.selectNodeContents(badge);
      const text = range.getBoundingClientRect().width;
      return badge.getBoundingClientRect().width >= text + padding + border - 0.5;
    }),
    'the badge was squeezed narrower than its own text plus padding'
  );

  // Pagination — the current page keeps its accent under the pointer --------
  const bgOf = (id) => page.evaluate((s) => getComputedStyle(document.querySelector(s)).backgroundColor, `#${id}`);
  // --ja-surface-raised is the same white as --ja-surface in the light theme, so
  // an ordinary chip's hover is a lift, not a repaint — measure the travel.
  const liftOf = (id) => page.evaluate((s) => getComputedStyle(document.querySelector(s)).translate, `#${id}`);
  const currentAtRest = await bgOf('pg-current');
  const otherAtRest = await liftOf('pg-other');
  await page.hover('#pg-current');
  await page.waitForTimeout(250);
  const currentHovered = await bgOf('pg-current');
  check(
    'hovering the current page keeps its accent fill',
    currentHovered === currentAtRest,
    `the chip went from ${currentAtRest} to ${currentHovered}`
  );
  await page.hover('#pg-other');
  await page.waitForTimeout(250);
  const otherHovered = await liftOf('pg-other');
  check(
    'hovering an ordinary page still lifts it',
    otherHovered !== otherAtRest,
    `the chip stayed at ${otherAtRest} — the hover rule is not landing at all`
  );

  // Theme API --------------------------------------------------------------
  await page.evaluate(() => window.JaUI.setTheme('dark'));
  check('setTheme flips the attribute', (await page.getAttribute('html', 'data-theme')) === 'dark');
  check('resolved theme reports dark', await page.evaluate(() => window.JaUI.getResolvedTheme() === 'dark'));

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
