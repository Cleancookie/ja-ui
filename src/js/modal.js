import { Component } from './base.js';
import {
  fromHTML,
  lockScroll,
  onTransitionEnd,
  reflow,
  trapFocus,
  unlockScroll,
  getFocusable,
} from './dom.js';

const openModals = [];

/**
 * Modal — focus-trapped, scroll-locking, Escape-closing. A `static` backdrop
 * nudges the dialog instead of closing, so the user knows the click landed.
 */
export class Modal extends Component {
  static NAME = 'modal';
  static Default = {
    /** true | false | 'static' */
    backdrop: true,
    /** Close on Escape. */
    keyboard: true,
    /** Move focus into the dialog when it opens. */
    focus: true,
  };

  constructor(element, config) {
    super(element, config);
    this._backdrop = null;
    this._releaseFocus = null;
    this._isTransitioning = false;
    this._onKeydown = this._handleKeydown.bind(this);
    this._onClick = this._handleClick.bind(this);
    this._element.setAttribute('tabindex', '-1');
    if (!this._element.hasAttribute('role')) this._element.setAttribute('role', 'dialog');
    this._element.setAttribute('aria-modal', 'true');
  }

  get isShown() {
    return this._element.classList.contains('show');
  }

  toggle(relatedTarget) {
    return this.isShown ? this.hide() : this.show(relatedTarget);
  }

  show(relatedTarget = null) {
    if (this.isShown || this._isTransitioning) return;
    if (!this._emit('show', { relatedTarget }, true)) return;

    this._isTransitioning = true;
    openModals.push(this);
    lockScroll();
    this._showBackdrop();

    const element = this._element;
    element.style.display = 'block';
    element.removeAttribute('aria-hidden');
    reflow(element);
    element.classList.add('show');

    element.addEventListener('click', this._onClick);
    document.addEventListener('keydown', this._onKeydown);

    onTransitionEnd(element.querySelector('.modal-dialog') ?? element, () => {
      this._isTransitioning = false;
      if (this._config.focus) {
        this._releaseFocus = trapFocus(element);
        const [first] = getFocusable(element);
        (first ?? element).focus();
      }
      this._emit('shown', { relatedTarget });
    });
  }

  hide() {
    if (!this.isShown || this._isTransitioning) return;
    if (!this._emit('hide', {}, true)) return;

    this._isTransitioning = true;
    const element = this._element;
    element.classList.remove('show');
    element.removeEventListener('click', this._onClick);
    document.removeEventListener('keydown', this._onKeydown);
    this._hideBackdrop();

    onTransitionEnd(element.querySelector('.modal-dialog') ?? element, () => {
      element.style.display = 'none';
      element.setAttribute('aria-hidden', 'true');
      this._releaseFocus?.();
      this._releaseFocus = null;
      const index = openModals.indexOf(this);
      if (index > -1) openModals.splice(index, 1);
      unlockScroll();
      this._isTransitioning = false;
      this._emit('hidden');
    });
  }

  _showBackdrop() {
    if (!this._config.backdrop) return;
    this._backdrop = fromHTML('<div class="modal-backdrop"></div>');
    document.body.append(this._backdrop);
    reflow(this._backdrop);
    this._backdrop.classList.add('show');
  }

  _hideBackdrop() {
    const backdrop = this._backdrop;
    if (!backdrop) return;
    this._backdrop = null;
    backdrop.classList.remove('show');
    onTransitionEnd(backdrop, () => backdrop.remove());
  }

  _handleClick(event) {
    if (event.target !== this._element) return; // clicks land on the scroll area
    if (this._config.backdrop === 'static') {
      this._nudge();
      return;
    }
    if (this._config.backdrop) this.hide();
  }

  _handleKeydown(event) {
    if (event.key !== 'Escape') return;
    if (openModals[openModals.length - 1] !== this) return;
    if (!this._config.keyboard) {
      this._nudge();
      return;
    }
    event.preventDefault();
    this.hide();
  }

  /** Mechanical "no" — the dialog shoves back instead of closing. */
  _nudge() {
    const dialog = this._element.querySelector('.modal-dialog');
    if (!dialog) return;
    dialog.animate(
      [
        { translate: '0 0' },
        { translate: '-8px 0' },
        { translate: '8px 0' },
        { translate: '-4px 0' },
        { translate: '0 0' },
      ],
      { duration: 220, easing: 'steps(5, end)' }
    );
  }

  dispose() {
    document.removeEventListener('keydown', this._onKeydown);
    this._element.removeEventListener('click', this._onClick);
    this._releaseFocus?.({ restoreFocus: false });
    super.dispose();
  }
}
