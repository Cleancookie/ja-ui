/**
 * ja-ui — Just Another UI
 *
 *   import '@cleancookie/ja-ui/css';
 *   import { Modal } from '@cleancookie/ja-ui';
 *
 * Everything here is optional: the CSS works on its own, and the JS is only
 * needed for the interactive components. Zero runtime dependencies.
 */

export { Component } from './js/base.js';
export { Alert } from './js/alert.js';
export { Button } from './js/button.js';
export { Collapse } from './js/collapse.js';
export { Dropdown } from './js/dropdown.js';
export { Modal } from './js/modal.js';
export { Offcanvas } from './js/offcanvas.js';
export { Tab } from './js/tab.js';
export { Toast } from './js/toast.js';
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

/** Wire up data attributes as soon as the DOM is ready, unless opted out. */
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
