import { Component } from './base.js';
import { onTransitionEnd } from './dom.js';

/** Alert — dismissal, with the element removed once it has faded. */
export class Alert extends Component {
  static NAME = 'alert';

  close() {
    if (!this._emit('close', {}, true)) return;
    const element = this._element;
    element.classList.remove('show');
    onTransitionEnd(element, () => {
      this._emit('closed');
      element.remove();
      this.dispose();
    });
  }
}
