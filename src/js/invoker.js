/**
 * Invoker commands — the fallback half only.
 *
 *   <button commandfor="confirm" command="show-modal">Delete…</button>
 *   <dialog id="confirm">
 *     <button commandfor="confirm" command="close">Cancel</button>
 *   </dialog>
 *
 * `command` / `commandfor` reached Baseline in December 2025, which is recent
 * enough that a meaningful share of browsers still ignore it — and unlike
 * `popovertarget`, an unsupported invoker button is simply *dead*: nothing
 * happens, with no error and no visible clue. That is worse than not shipping
 * it, so this module fills the gap and then gets out of the way.
 *
 * Where the platform already implements it, this module binds nothing at all.
 */

const NATIVE =
  typeof HTMLButtonElement !== 'undefined' && 'command' in HTMLButtonElement.prototype;

/** The built-in commands, minus the ones with no cross-browser meaning. */
const ACTIONS = {
  'show-modal': (target) => target.showModal?.(),
  close: (target, source) => target.close?.(source.value || undefined),
  'request-close': (target, source) =>
    target.requestClose
      ? target.requestClose(source.value || undefined)
      : target.close?.(source.value || undefined),
  'show-popover': (target) => target.showPopover?.(),
  'hide-popover': (target) => target.hidePopover?.(),
  'toggle-popover': (target) => target.togglePopover?.(),
};

function handle(event) {
  const source = event.target.closest?.('[commandfor][command]');
  if (!source || source.disabled) return;

  const target = document.getElementById(source.getAttribute('commandfor'));
  if (!target) return;

  const name = source.getAttribute('command');

  // A custom command (`--do-something`) is the author's own business: dispatch
  // the event and let them handle it, exactly as the native API would.
  if (name.startsWith('--')) {
    target.dispatchEvent(
      new CustomEvent('command', { bubbles: false, detail: { command: name, source } })
    );
    return;
  }

  const action = ACTIONS[name];
  if (!action) return;

  event.preventDefault();
  action(target, source);
}

let wired = false;

/**
 * Teach `commandfor` buttons to work on engines that do not implement them.
 * Idempotent, and a no-op where the platform already handles it.
 */
export function initInvokers() {
  if (NATIVE || wired) return;
  wired = true;
  document.addEventListener('click', handle);
}

/** Whether the browser implements invoker commands natively. */
export const hasNativeInvokers = NATIVE;
