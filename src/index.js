/**
 * ja-ui — Just Another UI
 *
 * Drop the stylesheet in and write plain semantic HTML. The CSS is the library;
 * this file is only the small remainder that the web platform does not do for
 * you. Zero runtime dependencies.
 *
 *   <link rel="stylesheet" href="ja-ui.css">
 *   <script type="module" src="ja-ui.js"></script>
 */

export { Component } from './js/base.js';

/* The two components with no native equivalent. */
export { CommandPalette } from './js/command-palette.js';
export { DataTable } from './js/datatable.js';
export { fuzzyMatch, fuzzyFilter, parseQuery } from './js/fuzzy.js';

/* The keyboard model for the one pattern HTML has no element for. */
export { initTabs, selectTab } from './js/tabs.js';

/* Transient messages, and the invoker-command fallback. */
export { toast, dismissToast } from './js/toast.js';
export { initInvokers, hasNativeInvokers } from './js/invoker.js';

export {
  getTheme,
  getResolvedTheme,
  setTheme,
  toggleTheme,
  getStyle,
  setStyle,
  restoreTheme,
} from './js/theme.js';

export { autoInit, resetAutoInit } from './js/autoinit.js';

import { autoInit } from './js/autoinit.js';

function boot() {
  if (typeof document === 'undefined') return;
  if (document.body?.hasAttribute('data-ja-no-autoinit')) return;
  autoInit();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
}

export const version = '0.1.0';
