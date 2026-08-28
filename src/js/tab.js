import { Component } from './base.js';
import { getTargetElement, onTransitionEnd, reflow } from './dom.js';

/** Tab — activates one trigger and its pane, with roving arrow-key focus. */
export class Tab extends Component {
  static NAME = 'tab';

  constructor(element, config) {
    super(element, config);
    this._onKeydown = this._handleKeydown.bind(this);
    this._element.addEventListener('keydown', this._onKeydown);
  }

  get _list() {
    return this._element.closest('.nav, .list-group');
  }

  show() {
    const trigger = this._element;
    if (trigger.classList.contains('active') || trigger.classList.contains('disabled')) return;

    const pane = getTargetElement(trigger);
    const list = this._list;
    const previous = list?.querySelector('.active');

    if (!this._emit('show', { relatedTarget: previous }, true)) return;

    if (previous) {
      previous.classList.remove('active');
      previous.setAttribute('aria-selected', 'false');
      previous.setAttribute('tabindex', '-1');
    }
    trigger.classList.add('active');
    trigger.setAttribute('aria-selected', 'true');
    trigger.removeAttribute('tabindex');

    if (!pane) {
      this._emit('shown', { relatedTarget: previous });
      return;
    }

    const container = pane.parentElement;
    const currentPane = container?.querySelector('.tab-pane.active');
    if (currentPane && currentPane !== pane) {
      currentPane.classList.remove('active', 'show');
    }
    pane.classList.add('active');
    reflow(pane);
    pane.classList.add('show');
    onTransitionEnd(pane, () => this._emit('shown', { relatedTarget: previous }));
  }

  _handleKeydown(event) {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const list = this._list;
    if (!list) return;

    const triggers = [...list.querySelectorAll('[data-ja-toggle="tab"]:not(.disabled)')];
    const index = triggers.indexOf(this._element);
    if (index < 0) return;

    event.preventDefault();
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    let next = index;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = triggers.length - 1;
    else next = (index + (forward ? 1 : -1) + triggers.length) % triggers.length;

    triggers[next].focus();
    Tab.getOrCreateInstance(triggers[next]).show();
  }

  dispose() {
    this._element.removeEventListener('keydown', this._onKeydown);
    super.dispose();
  }
}
