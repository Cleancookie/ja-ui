import { Alert } from './alert.js';
import { Button } from './button.js';
import { Collapse } from './collapse.js';
import { CommandPalette } from './command-palette.js';
import { Dropdown, initDropdownDismiss } from './dropdown.js';
import { Modal } from './modal.js';
import { Offcanvas } from './offcanvas.js';
import { Tab } from './tab.js';
import { Toast } from './toast.js';
import { getTargetElement } from './dom.js';
import { restoreTheme } from './theme.js';

const TOGGLES = {
  collapse: (target, trigger) =>
    Collapse.getOrCreateInstance(target, {
      parent: trigger.dataset.jaParent ?? null,
    }).toggle(),
  'command-palette': (target, trigger) => CommandPalette.getOrCreateInstance(target).toggle(trigger),
  dropdown: (_target, trigger) => Dropdown.getOrCreateInstance(trigger).toggle(),
  modal: (target, trigger) => Modal.getOrCreateInstance(target).toggle(trigger),
  offcanvas: (target, trigger) => Offcanvas.getOrCreateInstance(target).toggle(trigger),
  tab: (_target, trigger) => Tab.getOrCreateInstance(trigger).show(),
  toast: (target) => Toast.getOrCreateInstance(target).show(),
  button: (_target, trigger) => Button.getOrCreateInstance(trigger).toggle(),
};

const DISMISSALS = {
  alert: (element) => Alert.getOrCreateInstance(element).close(),
  'command-palette': (element) => CommandPalette.getOrCreateInstance(element).hide(),
  modal: (element) => Modal.getOrCreateInstance(element).hide(),
  offcanvas: (element) => Offcanvas.getOrCreateInstance(element).hide(),
  toast: (element) => Toast.getOrCreateInstance(element).hide(),
};

const SELECTORS = {
  alert: '.alert',
  'command-palette': '.command-palette',
  modal: '.modal',
  offcanvas: '.offcanvas',
  toast: '.toast',
};

let wired = false;

/**
 * Wire up every `data-ja-toggle` / `data-ja-dismiss` attribute on the page
 * with a single delegated listener. Safe to call more than once, and safe to
 * call before the elements exist — nothing is scanned up front.
 *
 * Opt out entirely with `<body data-ja-no-autoinit>`.
 */
export function autoInit() {
  if (wired) return;
  wired = true;

  restoreTheme();
  initDropdownDismiss();

  // A palette with a global shortcut has to exist before the shortcut is
  // pressed, so these are the one thing that is scanned up front.
  for (const element of document.querySelectorAll('.command-palette[data-ja-hotkey]')) {
    CommandPalette.getOrCreateInstance(element);
  }

  document.addEventListener('click', (event) => {
    const dismisser = event.target.closest?.('[data-ja-dismiss]');
    if (dismisser) {
      const name = dismisser.dataset.jaDismiss;
      const handler = DISMISSALS[name];
      if (handler) {
        const target =
          (dismisser.dataset.jaTarget && document.querySelector(dismisser.dataset.jaTarget)) ||
          dismisser.closest(SELECTORS[name]);
        if (target) {
          event.preventDefault();
          handler(target);
          return;
        }
      }
    }

    const trigger = event.target.closest?.('[data-ja-toggle]');
    if (!trigger) return;

    const name = trigger.dataset.jaToggle;
    const handler = TOGGLES[name];
    if (!handler) return;

    const target = getTargetElement(trigger);
    if (!target && !['dropdown', 'button', 'tab'].includes(name)) return;

    if (trigger.tagName === 'A' || trigger.dataset.jaPreventDefault !== undefined) {
      event.preventDefault();
    }
    handler(target, trigger);
  });
}

/** Undo `autoInit`'s guard — mainly useful in tests and Storybook. */
export function resetAutoInit() {
  wired = false;
}
