import { Component } from './base.js';
import { getElement, onTransitionEnd, reflow } from './dom.js';

/**
 * Collapse — the engine behind accordions, the navbar toggler and any
 * show/hide region. Animates to the element's real size, then releases the
 * inline style so the content can reflow freely.
 */
export class Collapse extends Component {
  static NAME = 'collapse';
  static Default = {
    /** Selector for a parent accordion; siblings close when this one opens. */
    parent: null,
    /** Toggle immediately on construction. */
    toggle: false,
  };

  constructor(element, config) {
    super(element, config);
    this._isTransitioning = false;
    this._parent = this._config.parent ? getElement(this._config.parent) : null;
    if (this._config.toggle) this.toggle();
  }

  get _dimension() {
    return this._element.classList.contains('collapse-horizontal') ? 'width' : 'height';
  }

  get isShown() {
    return this._element.classList.contains('show');
  }

  toggle() {
    return this.isShown ? this.hide() : this.show();
  }

  show() {
    if (this._isTransitioning || this.isShown) return;
    if (!this._emit('show', {}, true)) return;

    this._closeSiblings();

    const element = this._element;
    const dimension = this._dimension;
    const scrollSize = dimension === 'width' ? 'scrollWidth' : 'scrollHeight';

    this._isTransitioning = true;
    element.classList.remove('collapse');
    element.classList.add('collapsing');
    element.style[dimension] = '0px';
    reflow(element);
    element.style[dimension] = `${element[scrollSize]}px`;
    this._setTriggers(true);

    onTransitionEnd(element, () => {
      element.classList.remove('collapsing');
      element.classList.add('collapse', 'show');
      element.style[dimension] = '';
      this._isTransitioning = false;
      this._emit('shown');
    });
  }

  hide() {
    if (this._isTransitioning || !this.isShown) return;
    if (!this._emit('hide', {}, true)) return;

    const element = this._element;
    const dimension = this._dimension;
    const offsetSize = dimension === 'width' ? 'offsetWidth' : 'offsetHeight';

    this._isTransitioning = true;
    element.style[dimension] = `${element[offsetSize]}px`;
    reflow(element);
    element.classList.add('collapsing');
    element.classList.remove('collapse', 'show');
    element.style[dimension] = '0px';
    this._setTriggers(false);

    onTransitionEnd(element, () => {
      element.classList.remove('collapsing');
      element.classList.add('collapse');
      element.style[dimension] = '';
      this._isTransitioning = false;
      this._emit('hidden');
    });
  }

  /** Keep every trigger that points at this region in sync. */
  _setTriggers(expanded) {
    const id = this._element.id;
    const triggers = document.querySelectorAll(
      `[data-ja-toggle="collapse"][data-ja-target="#${CSS.escape(id ?? '')}"],` +
        `[data-ja-toggle="collapse"][href="#${CSS.escape(id ?? '')}"]`
    );
    for (const trigger of triggers) {
      trigger.setAttribute('aria-expanded', String(expanded));
      trigger.classList.toggle('collapsed', !expanded);
    }
  }

  _closeSiblings() {
    if (!this._parent) return;
    const open = this._parent.querySelectorAll('.collapse.show');
    for (const sibling of open) {
      if (sibling === this._element) continue;
      Collapse.getOrCreateInstance(sibling).hide();
    }
  }

  dispose() {
    this._parent = null;
    super.dispose();
  }
}
