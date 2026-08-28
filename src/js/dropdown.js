import { Component } from './base.js';
import { getElement } from './dom.js';

const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'Home', 'End']);
let openDropdown = null;

/**
 * Dropdown — CSS handles placement; this only opens, closes, flips when the
 * menu would leave the viewport, and wires up keyboard navigation.
 */
export class Dropdown extends Component {
  static NAME = 'dropdown';
  static Default = {
    /** Close when a menu item is clicked. */
    autoClose: true,
  };

  constructor(element, config) {
    super(element, config);
    this._parent = this._element.closest('.dropdown, .dropup, .dropend, .dropstart, .btn-group');
    this._menu = this._parent?.querySelector('.dropdown-menu') ?? null;
    this._onKeydown = this._handleKeydown.bind(this);
    this._element.setAttribute('aria-expanded', 'false');
    if (this._menu && !this._element.hasAttribute('aria-haspopup')) {
      this._element.setAttribute('aria-haspopup', 'true');
    }
  }

  get isShown() {
    return Boolean(this._menu?.classList.contains('show'));
  }

  toggle() {
    return this.isShown ? this.hide() : this.show();
  }

  show() {
    if (!this._menu || this.isShown) return;
    if (!this._emit('show', {}, true)) return;

    openDropdown?.hide();
    openDropdown = this;

    this._menu.classList.add('show');
    this._element.setAttribute('aria-expanded', 'true');
    this._element.classList.add('show');
    this._flipIfClipped();
    document.addEventListener('keydown', this._onKeydown);
    this._emit('shown');
  }

  hide() {
    if (!this._menu || !this.isShown) return;
    if (!this._emit('hide', {}, true)) return;

    this._menu.classList.remove('show');
    this._menu.removeAttribute('data-ja-placement');
    this._element.setAttribute('aria-expanded', 'false');
    this._element.classList.remove('show');
    document.removeEventListener('keydown', this._onKeydown);
    if (openDropdown === this) openDropdown = null;
    this._emit('hidden');
  }

  /** Nudge the menu above / to the other side when it would overflow. */
  _flipIfClipped() {
    const rect = this._menu.getBoundingClientRect();
    const flipUp = rect.bottom > window.innerHeight && rect.top > rect.height;
    const flipEnd = rect.right > window.innerWidth;
    const placement = `${flipUp ? 'top' : 'bottom'}-${flipEnd ? 'end' : 'start'}`;
    this._menu.dataset.jaPlacement = placement;
  }

  _items() {
    return [...this._menu.querySelectorAll('.dropdown-item:not(.disabled):not(:disabled)')];
  }

  _handleKeydown(event) {
    if (event.key === 'Escape') {
      this.hide();
      this._element.focus();
      return;
    }
    if (event.key === 'Tab' && !this._parent.contains(event.target)) {
      this.hide();
      return;
    }
    if (!ARROW_KEYS.has(event.key)) return;

    event.preventDefault();
    const items = this._items();
    if (!items.length) return;
    const index = items.indexOf(document.activeElement);
    let next = 0;
    if (event.key === 'ArrowDown') next = index < 0 ? 0 : (index + 1) % items.length;
    else if (event.key === 'ArrowUp') next = index <= 0 ? items.length - 1 : index - 1;
    else if (event.key === 'End') next = items.length - 1;
    items[next].focus();
  }

  dispose() {
    document.removeEventListener('keydown', this._onKeydown);
    if (openDropdown === this) openDropdown = null;
    super.dispose();
  }

  /** Close any open dropdown — used by the global click handler. */
  static closeAll(exceptTarget = null) {
    if (!openDropdown) return;
    if (exceptTarget && openDropdown._parent?.contains(exceptTarget)) return;
    openDropdown.hide();
  }
}

export function initDropdownDismiss() {
  document.addEventListener('click', (event) => {
    const inMenu = event.target.closest?.('.dropdown-menu');
    if (inMenu && openDropdown && openDropdown._config.autoClose) {
      if (event.target.closest('.dropdown-item')) openDropdown.hide();
      return;
    }
    Dropdown.closeAll(event.target);
  });
}

export { getElement };
