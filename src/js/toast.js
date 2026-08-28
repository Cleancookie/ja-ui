import { Component } from './base.js';
import { onTransitionEnd, reflow } from './dom.js';

/** Toast — auto-hiding notification that pauses while hovered or focused. */
export class Toast extends Component {
  static NAME = 'toast';
  static Default = {
    /** Hide automatically after `delay` ms. */
    autohide: true,
    delay: 5000,
  };

  constructor(element, config) {
    super(element, config);
    this._timer = null;
    this._hasFocus = false;
    this._hasHover = false;
    this._element.style.setProperty('--ja-toast-delay', `${this._config.delay}ms`);
    if (!this._element.hasAttribute('role')) this._element.setAttribute('role', 'status');
    if (!this._element.hasAttribute('aria-live')) {
      this._element.setAttribute('aria-live', 'polite');
    }
    this._bindPause();
  }

  get isShown() {
    return this._element.classList.contains('show');
  }

  show() {
    if (this.isShown) return;
    if (!this._emit('show', {}, true)) return;

    const element = this._element;
    element.classList.remove('hide');
    element.classList.add('show');
    reflow(element);
    this._restartTimer();
    this._emit('shown');
  }

  hide() {
    if (!this.isShown) return;
    if (!this._emit('hide', {}, true)) return;

    this._clearTimer();
    const element = this._element;
    element.classList.remove('show');
    onTransitionEnd(element, () => {
      element.classList.add('hide');
      this._emit('hidden');
    });
  }

  _bindPause() {
    const pause = () => this._clearTimer();
    const resume = () => {
      if (!this._hasHover && !this._hasFocus) this._restartTimer();
    };
    this._element.addEventListener('mouseenter', () => {
      this._hasHover = true;
      pause();
    });
    this._element.addEventListener('mouseleave', () => {
      this._hasHover = false;
      resume();
    });
    this._element.addEventListener('focusin', () => {
      this._hasFocus = true;
      pause();
    });
    this._element.addEventListener('focusout', () => {
      this._hasFocus = false;
      resume();
    });
  }

  _restartTimer() {
    this._clearTimer();
    if (!this._config.autohide) return;
    this._timer = setTimeout(() => this.hide(), this._config.delay);
  }

  _clearTimer() {
    if (this._timer) clearTimeout(this._timer);
    this._timer = null;
  }

  dispose() {
    this._clearTimer();
    super.dispose();
  }
}
