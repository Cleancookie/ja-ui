/**
 * Toasts — a transient message, in the top layer.
 *
 * The region is `popover="manual"`, deliberately not `auto`: an auto popover
 * light-dismisses on any outside click, which would silently swallow toasts the
 * moment the user carried on working. Manual means we own the lifetime.
 *
 * Each toast is `role="status"` — polite. `role="alert"` is assertive and
 * interrupts whatever the screen reader is saying, which is wrong for a
 * "Saved." confirmation. Focus is never moved to a toast: it would rip the
 * caret out of whatever the user was typing.
 */

const REGION_ID = 'ja-toasts';

function regionFor(placement) {
  const id = `${REGION_ID}-${placement}`;
  let region = document.getElementById(id);

  if (!region) {
    region = document.createElement('div');
    region.id = id;
    region.className = `toasts ${placement}`;
    region.setAttribute('popover', 'manual');
    document.body.append(region);
  }

  // The region has to already exist and be shown before anything is injected
  // into it, or the live region announces nothing.
  //
  // Re-shown every time, not just on creation: dismissToast hides the region
  // once the last toast leaves, so a region that outlives its toasts comes
  // back hidden and the next toast would be appended into a closed popover —
  // in the DOM, announced, and invisible. showPopover() throws on an
  // already-open popover, hence the state check rather than a bare call.
  if (region.showPopover && !region.matches(':popover-open')) region.showPopover();

  return region;
}

/**
 * Show a toast.
 *
 * @param {string|Node} message
 * @param {object} [options]
 * @param {string}  [options.variant]   a colour class — 'success', 'danger', …
 * @param {number}  [options.duration]  ms before it dismisses itself; 0 to persist
 * @param {string}  [options.placement] 'end' (default), 'start', 'top', 'bottom'
 * @param {boolean} [options.dismissible]
 * @returns {HTMLElement} the toast, so you can dismiss it early
 */
export function toast(message, options = {}) {
  const {
    variant = '',
    duration = 5000,
    placement = 'end',
    dismissible = true,
  } = options;

  const region = regionFor(placement);

  const element = document.createElement('output');
  element.className = `toast ${variant}`.trim();
  element.setAttribute('role', 'status');

  const body = document.createElement('span');
  if (typeof message === 'string') body.textContent = message;
  else body.append(message);
  element.append(body);

  if (dismissible) {
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'ghost sm icon';
    close.setAttribute('aria-label', 'Dismiss');
    close.textContent = '×';
    close.addEventListener('click', () => dismissToast(element));
    element.append(close);
  }

  region.append(element);
  element.dispatchEvent(new CustomEvent('ja:toast:shown', { bubbles: true, detail: { element } }));

  if (duration > 0) {
    let timer = setTimeout(() => dismissToast(element), duration);
    // Reading a toast takes longer than 5s for some people. Hovering or
    // focusing it stops the clock; leaving restarts it.
    const pause = () => clearTimeout(timer);
    const resume = () => {
      timer = setTimeout(() => dismissToast(element), duration);
    };
    element.addEventListener('pointerenter', pause);
    element.addEventListener('pointerleave', resume);
    element.addEventListener('focusin', pause);
    element.addEventListener('focusout', resume);
  }

  return element;
}

/** Dismiss a toast, letting its exit transition finish first. */
export function dismissToast(element) {
  if (!element?.isConnected) return;
  element.dispatchEvent(new CustomEvent('ja:toast:hide', { bubbles: true, detail: { element } }));

  const region = element.parentElement;
  const done = () => {
    element.remove();
    // An empty region left showing would keep an invisible top-layer element
    // over the page in engines that mis-handle pointer-events on it.
    if (region && !region.children.length) region.hidePopover?.();
  };

  // `transitionend` is the accurate signal, but it never fires if the exit
  // transition is overridden away, so a timer backs it up. Whichever lands
  // first wins; `settled` stops the other one running twice.
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    done();
  };

  const seconds = Number.parseFloat(getComputedStyle(element).transitionDuration) || 0;
  element.classList.add('leaving');
  if (seconds > 0) {
    element.addEventListener('transitionend', settle, { once: true });
    setTimeout(settle, seconds * 1000 + 50);
  } else {
    settle();
  }
}
