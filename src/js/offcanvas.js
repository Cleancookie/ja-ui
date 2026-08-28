import { Component } from './base.js';
import {
  fromHTML,
  getFocusable,
  lockScroll,
  onTransitionEnd,
  reflow,
  trapFocus,
  unlockScroll,
} from './dom.js';

/** Offcanvas — a drawer that slides in from any edge. */
export class Offcanvas extends Component {
  static NAME = 'offcanvas';
  static Default = {
    backdrop: true,
    keyboard: true,
    /** Keep the page scrollable while the drawer is open. */
    scroll: false,
  };

  constructor(element, config) {
    super(element, config);
    this._backdrop = null;
    this._releaseFocus = null;
    this._onKeydown = this._handleKeydown.bind(this);
    this._element.setAttribute('tabindex', '-1');
  }

  get isShown() {
    return this._element.classList.contains('show');
  }

  toggle(relatedTarget) {
    return this.isShown ? this.hide() : this.show(relatedTarget);
  }

  show(relatedTarget = null) {
    if (this.isShown) return;
    if (!this._emit('show', { relatedTarget }, true)) return;

    if (!this._config.scroll) lockScroll();
    if (this._config.backdrop) {
      this._backdrop = fromHTML('<div class="offcanvas-backdrop"></div>');
      this._backdrop.addEventListener('click', () => this.hide());
      document.body.append(this._backdrop);
      reflow(this._backdrop);
      this._backdrop.classList.add('show');
    }

    const element = this._element;
    element.classList.add('showing');
    reflow(element);
    element.classList.add('show');
    document.addEventListener('keydown', this._onKeydown);

    onTransitionEnd(element, () => {
      element.classList.remove('showing');
      this._releaseFocus = trapFocus(element);
      const [first] = getFocusable(element);
      (first ?? element).focus();
      this._emit('shown', { relatedTarget });
    });
  }

  hide() {
    if (!this.isShown) return;
    if (!this._emit('hide', {}, true)) return;

    const element = this._element;
    element.classList.remove('show');
    document.removeEventListener('keydown', this._onKeydown);

    const backdrop = this._backdrop;
    this._backdrop = null;
    backdrop?.classList.remove('show');

    onTransitionEnd(element, () => {
      backdrop?.remove();
      this._releaseFocus?.();
      this._releaseFocus = null;
      if (!this._config.scroll) unlockScroll();
      this._emit('hidden');
    });
  }

  _handleKeydown(event) {
    if (event.key === 'Escape' && this._config.keyboard) {
      event.preventDefault();
      this.hide();
    }
  }

  dispose() {
    document.removeEventListener('keydown', this._onKeydown);
    this._releaseFocus?.({ restoreFocus: false });
    super.dispose();
  }
}
