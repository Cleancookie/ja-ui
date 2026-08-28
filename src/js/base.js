import { getElement, readDataConfig } from './dom.js';

/** One instance registry per component class. */
const registries = new Map();

const registryFor = (Ctor) => {
  if (!registries.has(Ctor)) registries.set(Ctor, new WeakMap());
  return registries.get(Ctor);
};

/**
 * Shared plumbing for every ja-ui component: element resolution, config
 * merging (defaults < data-ja-* attributes < constructor options), an
 * instance registry keyed off the element, and namespaced events.
 *
 * Events are dispatched as `ja:<name>:<type>`, e.g. `ja:modal:shown`.
 * The `show` and `hide` events are cancelable — preventDefault() stops them.
 */
export class Component {
  static NAME = 'component';
  static Default = {};

  constructor(element, config = {}) {
    const resolved = getElement(element);
    if (!resolved) {
      throw new TypeError(`[ja-ui] ${this.constructor.NAME}: no element found for the given target.`);
    }
    this._element = resolved;
    this._config = {
      ...this.constructor.Default,
      ...readDataConfig(resolved, this.constructor.Default),
      ...config,
    };
    registryFor(this.constructor).set(resolved, this);
  }

  get element() {
    return this._element;
  }

  get config() {
    return this._config;
  }

  /** Dispatch `ja:<name>:<type>`; returns false if a listener cancelled it. */
  _emit(type, detail = {}, cancelable = false) {
    const event = new CustomEvent(`ja:${this.constructor.NAME}:${type}`, {
      bubbles: true,
      cancelable,
      detail: { ...detail, instance: this },
    });
    this._element.dispatchEvent(event);
    return !event.defaultPrevented;
  }

  dispose() {
    registryFor(this.constructor).delete(this._element);
    this._element = null;
    this._config = null;
  }

  static getInstance(element) {
    const resolved = getElement(element);
    return resolved ? registryFor(this).get(resolved) ?? null : null;
  }

  static getOrCreateInstance(element, config = {}) {
    return this.getInstance(element) ?? new this(element, config);
  }
}
