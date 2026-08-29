import { initInvokers } from './invoker.js';
import { initTabs } from './tabs.js';
import { CommandPalette } from './command-palette.js';
import { DataTable } from './datatable.js';
import { restoreTheme, toggleTheme } from './theme.js';

let wired = false;

/**
 * Wire up the handful of things that still need JavaScript. Safe to call more
 * than once, and safe to call before most elements exist — everything here is
 * either a delegated listener or a scan for the two components that must be
 * constructed eagerly.
 *
 * Opt out entirely with `<body data-ja-no-autoinit>`.
 *
 * Note how little there is. `<dialog>`, `<details>` and `[popover]` need no
 * initialisation at all: they are the platform. This file exists for the four
 * things the platform does not do — restoring a stored theme, the invoker
 * fallback, the tabs keyboard model, and the two custom components.
 */
export function autoInit() {
  if (wired) return;
  wired = true;

  restoreTheme();
  initInvokers();
  initTabs();

  // A palette bound to a global shortcut has to exist before the shortcut is
  // pressed, so these are scanned up front rather than lazily.
  for (const element of document.querySelectorAll('.command-palette[data-ja-hotkey]')) {
    CommandPalette.getOrCreateInstance(element);
  }
  for (const element of document.querySelectorAll('[data-ja-datatable]')) {
    DataTable.getOrCreateInstance(element);
  }

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest?.('[data-ja-theme-toggle]');
    if (!toggle) return;
    event.preventDefault();
    toggleTheme();
  });
}

/** Undo `autoInit`'s guard — mainly useful in tests and Storybook. */
export function resetAutoInit() {
  wired = false;
}
