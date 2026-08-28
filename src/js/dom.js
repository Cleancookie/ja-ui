/**
 * ja-ui — small DOM helpers.
 * No dependencies, no polyfills, no jQuery-isms. Modern browsers only.
 */

export const isElement = (value) => Boolean(value && value.nodeType === Node.ELEMENT_NODE);

/** Accept an element or a selector everywhere a "target" is taken. */
export function getElement(target) {
  if (isElement(target)) return target;
  if (typeof target === 'string') return document.querySelector(target);
  if (target && typeof target.jquery === 'string' && target.length) return target[0];
  return null;
}

/** Resolve the element a trigger points at, via data-ja-target or href. */
export function getTargetElement(trigger) {
  const selector =
    trigger.dataset.jaTarget ||
    (trigger.getAttribute('href')?.startsWith('#') ? trigger.getAttribute('href') : null);
  return selector ? document.querySelector(selector) : null;
}

/** Force a style recalculation so the next class change animates. */
export const reflow = (element) => element.offsetHeight;

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Longest transition/animation on an element, in ms. */
export function getTransitionDuration(element) {
  if (!element || prefersReducedMotion()) return 0;
  const styles = window.getComputedStyle(element);
  const toMs = (value) =>
    value
      .split(',')
      .map((v) => (v.includes('ms') ? parseFloat(v) : parseFloat(v) * 1000))
      .reduce((max, v) => Math.max(max, Number.isNaN(v) ? 0 : v), 0);
  return Math.max(
    toMs(styles.transitionDuration) + toMs(styles.transitionDelay),
    toMs(styles.animationDuration) + toMs(styles.animationDelay)
  );
}

/**
 * Run `done` when the element's transition finishes — or after a safety
 * timeout, so a cancelled or absent transition can never wedge a component.
 */
export function onTransitionEnd(element, done) {
  const duration = getTransitionDuration(element);
  if (!duration) {
    done();
    return () => {};
  }
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    element.removeEventListener('transitionend', handler);
    clearTimeout(timer);
    done();
  };
  const handler = (event) => {
    if (event.target === element) finish();
  };
  const timer = setTimeout(finish, duration + 40);
  element.addEventListener('transitionend', handler);
  return finish;
}

/** Read data-ja-* attributes off an element as a camelCased config object. */
export function readDataConfig(element, allowed) {
  const config = {};
  for (const [key, value] of Object.entries(element.dataset)) {
    if (!key.startsWith('ja')) continue;
    const name = key.slice(2, 3).toLowerCase() + key.slice(3);
    if (!name || (allowed && !(name in allowed))) continue;
    if (value === 'true' || value === '') config[name] = true;
    else if (value === 'false') config[name] = false;
    else if (value === 'null') config[name] = null;
    else if (value !== '' && !Number.isNaN(Number(value))) config[name] = Number(value);
    else config[name] = value;
  }
  return config;
}

export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

export const getFocusable = (container) =>
  [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );

/**
 * Keep Tab inside `container` until the returned function is called.
 * Restores focus to whatever was focused beforehand.
 */
export function trapFocus(container) {
  const previouslyFocused = document.activeElement;

  const onKeydown = (event) => {
    if (event.key !== 'Tab') return;
    const focusable = getFocusable(container);
    if (!focusable.length) {
      event.preventDefault();
      container.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onFocusIn = (event) => {
    if (!container.contains(event.target)) {
      const [first] = getFocusable(container);
      (first || container).focus();
    }
  };

  document.addEventListener('keydown', onKeydown);
  document.addEventListener('focusin', onFocusIn);

  return function release({ restoreFocus = true } = {}) {
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('focusin', onFocusIn);
    if (restoreFocus && isElement(previouslyFocused) && previouslyFocused.isConnected) {
      previouslyFocused.focus();
    }
  };
}

/** Reference-counted scroll lock, so stacked overlays can't unlock early. */
let scrollLocks = 0;
export function lockScroll() {
  scrollLocks += 1;
  document.body.classList.add('ja-scroll-locked');
}
export function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) document.body.classList.remove('ja-scroll-locked');
}

/** Create an element from an HTML string. */
export function fromHTML(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}
