import { Component } from './base.js';

/** Button — toggle state for `data-ja-toggle="button"`. */
export class Button extends Component {
  static NAME = 'button';

  toggle() {
    const pressed = this._element.classList.toggle('active');
    this._element.setAttribute('aria-pressed', String(pressed));
    this._emit('toggled', { pressed });
    return pressed;
  }
}
