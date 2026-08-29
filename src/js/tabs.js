/**
 * Tabs — the one navigation pattern with no native element.
 *
 * There is no `<tabs>`. The Open UI proposal is still an Editor's Draft and the
 * WHATWG issue has been open since 2016, so the W3C ARIA Authoring Practices
 * pattern is the standard, and this module is its keyboard model. Everything
 * visual is CSS keyed off `aria-selected`; this file only moves state.
 *
 * The markup contract — all of it is required:
 *
 *   <div role="tablist" aria-label="Sections">
 *     <button role="tab" aria-selected="true"  aria-controls="p1" id="t1" tabindex="0">One</button>
 *     <button role="tab" aria-selected="false" aria-controls="p2" id="t2" tabindex="-1">Two</button>
 *   </div>
 *   <div id="p1" role="tabpanel" tabindex="0" aria-labelledby="t1">…</div>
 *   <div id="p2" role="tabpanel" tabindex="0" aria-labelledby="t2" hidden>…</div>
 *
 * `aria-selected` goes on *every* tab, not just the active one, and exactly one
 * tab is in the tab order at a time (roving tabindex) so Tab moves past the
 * whole tablist rather than through it.
 *
 * Activation follows focus by default, which is the APG's recommendation when
 * panels are cheap to show. Put `data-ja-activation="manual"` on the tablist
 * when a panel is expensive, and arrows will move focus without selecting.
 */

const TABLIST = '[role="tablist"]';
const TAB = '[role="tab"]';

/** Tabs belonging to this tablist, ignoring any nested one. */
const tabsIn = (tablist) =>
  [...tablist.querySelectorAll(TAB)].filter((tab) => tab.closest(TABLIST) === tablist);

const panelFor = (tab) => {
  const id = tab.getAttribute('aria-controls');
  return id ? document.getElementById(id) : null;
};

const isVertical = (tablist) => tablist.getAttribute('aria-orientation') === 'vertical';

/**
 * Select a tab, hide its siblings' panels, and move the tab order onto it.
 * Fires a cancelable `ja:tabs:show`, then `ja:tabs:shown`, on the tablist.
 */
export function selectTab(tab, { focus = false } = {}) {
  const tablist = tab.closest(TABLIST);
  if (!tablist) return false;

  const tabs = tabsIn(tablist);
  const previous = tabs.find((candidate) => candidate.getAttribute('aria-selected') === 'true');
  if (previous === tab) {
    if (focus) tab.focus();
    return true;
  }

  const show = new CustomEvent('ja:tabs:show', {
    bubbles: true,
    cancelable: true,
    detail: { tab, previous, panel: panelFor(tab) },
  });
  tablist.dispatchEvent(show);
  if (show.defaultPrevented) return false;

  for (const candidate of tabs) {
    const selected = candidate === tab;
    candidate.setAttribute('aria-selected', String(selected));
    candidate.tabIndex = selected ? 0 : -1;
    const panel = panelFor(candidate);
    if (panel) panel.hidden = !selected;
  }

  if (focus) tab.focus();

  tablist.dispatchEvent(
    new CustomEvent('ja:tabs:shown', {
      bubbles: true,
      detail: { tab, previous, panel: panelFor(tab) },
    })
  );
  return true;
}

function onKeydown(event) {
  const tab = event.target.closest?.(TAB);
  if (!tab) return;
  const tablist = tab.closest(TABLIST);
  if (!tablist) return;

  const tabs = tabsIn(tablist).filter((candidate) => !candidate.disabled);
  const index = tabs.indexOf(tab);
  if (index === -1) return;

  const vertical = isVertical(tablist);
  const next = vertical ? 'ArrowDown' : 'ArrowRight';
  const previous = vertical ? 'ArrowUp' : 'ArrowLeft';
  const manual = tablist.dataset.jaActivation === 'manual';

  let target = null;
  switch (event.key) {
    case next:
      target = tabs[(index + 1) % tabs.length]; // wraps, per the APG
      break;
    case previous:
      target = tabs[(index - 1 + tabs.length) % tabs.length];
      break;
    case 'Home':
      target = tabs[0];
      break;
    case 'End':
      target = tabs.at(-1);
      break;
    case 'Enter':
    case ' ':
      if (manual) {
        event.preventDefault();
        selectTab(tab, { focus: true });
      }
      return;
    default:
      return;
  }

  if (!target) return;
  event.preventDefault();
  if (manual) target.focus();
  else selectTab(target, { focus: true });
}

function onClick(event) {
  const tab = event.target.closest?.(TAB);
  if (!tab || tab.disabled) return;
  event.preventDefault();
  selectTab(tab, { focus: true });
}

let wired = false;

/** Wire every tablist on the page with two delegated listeners. Idempotent. */
export function initTabs() {
  if (wired) return;
  wired = true;
  document.addEventListener('click', onClick);
  document.addEventListener('keydown', onKeydown);
}
