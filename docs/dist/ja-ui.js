// src/js/dom.js
var isElement = (value) => Boolean(value && value.nodeType === Node.ELEMENT_NODE);
function getElement(target) {
  if (isElement(target)) return target;
  if (typeof target === "string") return document.querySelector(target);
  if (target && typeof target.jquery === "string" && target.length) return target[0];
  return null;
}
function getTargetElement(trigger) {
  const selector = trigger.dataset.jaTarget || (trigger.getAttribute("href")?.startsWith("#") ? trigger.getAttribute("href") : null);
  return selector ? document.querySelector(selector) : null;
}
var reflow = (element) => element.offsetHeight;
var prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function getTransitionDuration(element) {
  if (!element || prefersReducedMotion()) return 0;
  const styles = window.getComputedStyle(element);
  const toMs = (value) => value.split(",").map((v) => v.includes("ms") ? parseFloat(v) : parseFloat(v) * 1e3).reduce((max, v) => Math.max(max, Number.isNaN(v) ? 0 : v), 0);
  return Math.max(
    toMs(styles.transitionDuration) + toMs(styles.transitionDelay),
    toMs(styles.animationDuration) + toMs(styles.animationDelay)
  );
}
function onTransitionEnd(element, done) {
  const duration = getTransitionDuration(element);
  if (!duration) {
    done();
    return () => {
    };
  }
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    element.removeEventListener("transitionend", handler);
    clearTimeout(timer);
    done();
  };
  const handler = (event) => {
    if (event.target === element) finish();
  };
  const timer = setTimeout(finish, duration + 40);
  element.addEventListener("transitionend", handler);
  return finish;
}
function readDataConfig(element, allowed) {
  const config = {};
  for (const [key, value] of Object.entries(element.dataset)) {
    if (!key.startsWith("ja")) continue;
    const name = key.slice(2, 3).toLowerCase() + key.slice(3);
    if (!name || allowed && !(name in allowed)) continue;
    if (value === "true" || value === "") config[name] = true;
    else if (value === "false") config[name] = false;
    else if (value === "null") config[name] = null;
    else if (value !== "" && !Number.isNaN(Number(value))) config[name] = Number(value);
    else config[name] = value;
  }
  return config;
}
var FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(",");
var getFocusable = (container) => [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
  (el) => el.offsetParent !== null || el === document.activeElement
);
function trapFocus(container) {
  const previouslyFocused = document.activeElement;
  const onKeydown = (event) => {
    if (event.key !== "Tab") return;
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
  document.addEventListener("keydown", onKeydown);
  document.addEventListener("focusin", onFocusIn);
  return function release({ restoreFocus = true } = {}) {
    document.removeEventListener("keydown", onKeydown);
    document.removeEventListener("focusin", onFocusIn);
    if (restoreFocus && isElement(previouslyFocused) && previouslyFocused.isConnected) {
      previouslyFocused.focus();
    }
  };
}
var scrollLocks = 0;
function lockScroll() {
  scrollLocks += 1;
  document.body.classList.add("ja-scroll-locked");
}
function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) document.body.classList.remove("ja-scroll-locked");
}
function fromHTML(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

// src/js/base.js
var registries = /* @__PURE__ */ new Map();
var registryFor = (Ctor) => {
  if (!registries.has(Ctor)) registries.set(Ctor, /* @__PURE__ */ new WeakMap());
  return registries.get(Ctor);
};
var Component = class {
  static NAME = "component";
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
      ...config
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
      detail: { ...detail, instance: this }
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
};

// src/js/alert.js
var Alert = class extends Component {
  static NAME = "alert";
  close() {
    if (!this._emit("close", {}, true)) return;
    const element = this._element;
    element.classList.remove("show");
    onTransitionEnd(element, () => {
      this._emit("closed");
      element.remove();
      this.dispose();
    });
  }
};

// src/js/button.js
var Button = class extends Component {
  static NAME = "button";
  toggle() {
    const pressed = this._element.classList.toggle("active");
    this._element.setAttribute("aria-pressed", String(pressed));
    this._emit("toggled", { pressed });
    return pressed;
  }
};

// src/js/collapse.js
var Collapse = class _Collapse extends Component {
  static NAME = "collapse";
  static Default = {
    /** Selector for a parent accordion; siblings close when this one opens. */
    parent: null,
    /** Toggle immediately on construction. */
    toggle: false
  };
  constructor(element, config) {
    super(element, config);
    this._isTransitioning = false;
    this._parent = this._config.parent ? getElement(this._config.parent) : null;
    if (this._config.toggle) this.toggle();
  }
  get _dimension() {
    return this._element.classList.contains("collapse-horizontal") ? "width" : "height";
  }
  get isShown() {
    return this._element.classList.contains("show");
  }
  toggle() {
    return this.isShown ? this.hide() : this.show();
  }
  show() {
    if (this._isTransitioning || this.isShown) return;
    if (!this._emit("show", {}, true)) return;
    this._closeSiblings();
    const element = this._element;
    const dimension = this._dimension;
    const scrollSize = dimension === "width" ? "scrollWidth" : "scrollHeight";
    this._isTransitioning = true;
    element.classList.remove("collapse");
    element.classList.add("collapsing");
    element.style[dimension] = "0px";
    reflow(element);
    element.style[dimension] = `${element[scrollSize]}px`;
    this._setTriggers(true);
    onTransitionEnd(element, () => {
      element.classList.remove("collapsing");
      element.classList.add("collapse", "show");
      element.style[dimension] = "";
      this._isTransitioning = false;
      this._emit("shown");
    });
  }
  hide() {
    if (this._isTransitioning || !this.isShown) return;
    if (!this._emit("hide", {}, true)) return;
    const element = this._element;
    const dimension = this._dimension;
    const offsetSize = dimension === "width" ? "offsetWidth" : "offsetHeight";
    this._isTransitioning = true;
    element.style[dimension] = `${element[offsetSize]}px`;
    reflow(element);
    element.classList.add("collapsing");
    element.classList.remove("collapse", "show");
    element.style[dimension] = "0px";
    this._setTriggers(false);
    onTransitionEnd(element, () => {
      element.classList.remove("collapsing");
      element.classList.add("collapse");
      element.style[dimension] = "";
      this._isTransitioning = false;
      this._emit("hidden");
    });
  }
  /** Keep every trigger that points at this region in sync. */
  _setTriggers(expanded) {
    const id = this._element.id;
    const triggers = document.querySelectorAll(
      `[data-ja-toggle="collapse"][data-ja-target="#${CSS.escape(id ?? "")}"],[data-ja-toggle="collapse"][href="#${CSS.escape(id ?? "")}"]`
    );
    for (const trigger of triggers) {
      trigger.setAttribute("aria-expanded", String(expanded));
      trigger.classList.toggle("collapsed", !expanded);
    }
  }
  _closeSiblings() {
    if (!this._parent) return;
    const open = this._parent.querySelectorAll(".collapse.show");
    for (const sibling of open) {
      if (sibling === this._element) continue;
      _Collapse.getOrCreateInstance(sibling).hide();
    }
  }
  dispose() {
    this._parent = null;
    super.dispose();
  }
};

// src/js/fuzzy.js
var SEPARATORS = "/\\-_ .:,()[]{}#@|>+";
var SCORE_MATCH = 16;
var BONUS_FIRST = 22;
var BONUS_BOUNDARY = 18;
var BONUS_CAMEL = 14;
var BONUS_CONSECUTIVE = 12;
var PENALTY_GAP_START = -6;
var PENALTY_GAP_EXTEND = -1;
var MAX_GAP_PENALTY = 12;
var SECONDARY_WEIGHT = 0.35;
var isSeparator = (char) => SEPARATORS.includes(char);
var isCamelBoundary = (text, pos) => {
  if (pos === 0) return false;
  const prev = text[pos - 1];
  const here = text[pos];
  return prev === prev.toLowerCase() && prev !== prev.toUpperCase() && here !== here.toLowerCase();
};
function subsequenceEnd(hay, needle) {
  const hayLength = hay.length;
  const needleLength = needle.length;
  if (needleLength > hayLength) return -1;
  let n = 0;
  for (let h = 0; h < hayLength; h += 1) {
    if (hay.charCodeAt(h) === needle.charCodeAt(n)) {
      n += 1;
      if (n === needleLength) return h + 1;
    }
  }
  return -1;
}
function tightestPositions(hay, needle) {
  const end = subsequenceEnd(hay, needle);
  if (end === -1) return null;
  const positions = new Array(needle.length);
  let n = needle.length - 1;
  for (let h = end - 1; h >= 0 && n >= 0; h -= 1) {
    if (hay.charCodeAt(h) === needle.charCodeAt(n)) {
      positions[n] = h;
      n -= 1;
    }
  }
  return positions;
}
function scorePositions(text, positions, primaryLength) {
  let score = 0;
  let previous = -2;
  for (let i = 0; i < positions.length; i += 1) {
    const pos = positions[i];
    let hit = SCORE_MATCH;
    if (pos === 0) hit += BONUS_FIRST;
    else if (isSeparator(text[pos - 1])) hit += BONUS_BOUNDARY;
    else if (isCamelBoundary(text, pos)) hit += BONUS_CAMEL;
    if (pos === previous + 1) hit += BONUS_CONSECUTIVE;
    else if (previous >= 0) {
      const gap = Math.min(pos - previous - 1, MAX_GAP_PENALTY);
      hit += PENALTY_GAP_START + PENALTY_GAP_EXTEND * gap;
    }
    score += pos < primaryLength ? hit : hit * SECONDARY_WEIGHT;
    previous = pos;
  }
  return score;
}
function fuzzyMatch(text, terms, options = {}) {
  const lowerText = options.lowerText ?? text.toLowerCase();
  const primaryLength = options.primaryLength ?? text.length;
  if (!terms.length) return { score: 0, positions: [] };
  let score = 0;
  let merged = null;
  for (let t = 0; t < terms.length; t += 1) {
    const positions2 = tightestPositions(lowerText, terms[t]);
    if (!positions2) return null;
    score += scorePositions(text, positions2, primaryLength);
    if (merged === null) merged = positions2;
    else merged = merged.concat(positions2);
  }
  if (terms.length > 1) merged.sort((a, b) => a - b);
  const positions = merged[merged.length - 1] < primaryLength ? merged : merged.filter((pos) => pos < primaryLength);
  return { score, positions };
}
var parseQuery = (query) => query.toLowerCase().split(/\s+/).filter(Boolean);
function fuzzyFilter(texts, query) {
  const terms = parseQuery(query);
  const results = [];
  for (let i = 0; i < texts.length; i += 1) {
    const match = fuzzyMatch(texts[i], terms);
    if (match) results.push({ index: i, score: match.score, positions: match.positions });
  }
  if (terms.length) {
    results.sort(
      (a, b) => b.score - a.score || texts[a.index].length - texts[b.index].length || a.index - b.index
    );
  }
  return results;
}

// src/js/command-palette.js
var paletteSeq = 0;
var ESCAPE_HTML = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
var escapeHtml = (value) => String(value).replace(/[&<>"]/g, (c) => ESCAPE_HTML[c]);
var isMac = () => typeof navigator !== "undefined" && /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent || "");
function parseHotkey(spec) {
  if (!spec || typeof spec !== "string") return null;
  const parts = spec.toLowerCase().split("+").map((part) => part.trim()).filter(Boolean);
  const key = parts.pop();
  if (!key) return null;
  const combo = { key, ctrl: false, meta: false, alt: false, shift: false };
  for (const part of parts) {
    if (part === "mod") combo[isMac() ? "meta" : "ctrl"] = true;
    else if (part === "ctrl" || part === "control") combo.ctrl = true;
    else if (part === "cmd" || part === "meta" || part === "super" || part === "win") combo.meta = true;
    else if (part === "alt" || part === "option") combo.alt = true;
    else if (part === "shift") combo.shift = true;
  }
  return combo;
}
var matchesHotkey = (event, combo) => combo && event.ctrlKey === combo.ctrl && event.metaKey === combo.meta && event.altKey === combo.alt && event.shiftKey === combo.shift && event.key.toLowerCase() === combo.key;
var SEARCH_ICON = '<svg class="command-palette-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
var TEMPLATE = `
<div class="command-palette-backdrop"></div>
<div class="command-palette-dialog" role="dialog" aria-modal="true">
  <div class="command-palette-search">
    ${SEARCH_ICON}
    <input class="command-palette-input" type="text" role="combobox" autocomplete="off"
           autocorrect="off" autocapitalize="off" spellcheck="false" aria-autocomplete="list" aria-expanded="true" />
    <kbd class="command-palette-esc">esc</kbd>
  </div>
  <div class="command-palette-list" role="listbox" tabindex="-1">
    <div class="command-palette-canvas">
      <div class="command-palette-highlight" aria-hidden="true"></div>
    </div>
    <p class="command-palette-empty" hidden></p>
  </div>
  <div class="command-palette-footer">
    <span class="command-palette-count" aria-live="polite"></span>
    <span class="command-palette-legend">
      <kbd>\u2191</kbd><kbd>\u2193</kbd> move <kbd>\u21B5</kbd> run <kbd>esc</kbd> close
    </span>
  </div>
</div>`;
var CommandPalette = class extends Component {
  static NAME = "command-palette";
  static Default = {
    /** Array of items, or a function returning one — called on every open. */
    items: null,
    placeholder: "Type a command\u2026",
    emptyText: "No matches",
    /** Global shortcut that opens it, e.g. "mod+k". Null wires up nothing. */
    hotkey: null,
    /** Dim the page behind, and close on an outside click. */
    backdrop: true,
    /** Close on Escape. */
    keyboard: true,
    /** Reset the query when it closes. */
    clearOnClose: true,
    /** Show group headers when the query is empty. */
    groups: true,
    /** Rows rendered above and below the visible window. */
    overscan: 4,
    /** Cap the number of results, 0 for no cap. */
    limit: 0,
    /** Keep it open after a selection. */
    keepOpen: false,
    /** Called with (item, event) when a row is chosen. */
    onSelect: null
  };
  constructor(element, config) {
    super(element, config);
    this._id = this._element.id || `ja-palette-${paletteSeq += 1}`;
    this._element.classList.add("command-palette");
    this._element.setAttribute("aria-hidden", "true");
    this._build();
    this._items = [];
    this._matches = [];
    this._rows = [];
    this._active = -1;
    this._query = "";
    this._lastQuery = null;
    this._lastMatches = null;
    this._itemHeight = 44;
    this._headerHeight = 30;
    this._canvasOffset = 0;
    this._itemPool = [];
    this._headerPool = [];
    this._window = { start: -1, end: -1 };
    this._frame = 0;
    this._releaseFocus = null;
    this._pointerArmed = false;
    this._pointerAt = null;
    this._hotkey = parseHotkey(this._config.hotkey);
    this._onDocumentKeydown = this._handleDocumentKeydown.bind(this);
    this._onKeydown = this._handleKeydown.bind(this);
    this._onInput = this._handleInput.bind(this);
    this._onScroll = () => this._scheduleRender();
    this._onResize = () => this._scheduleRender();
    this._onPointerMove = this._handlePointerMove.bind(this);
    this._onClick = this._handleClick.bind(this);
    this._element.addEventListener("keydown", this._onKeydown);
    this._element.addEventListener("click", this._onClick);
    this._input.addEventListener("input", this._onInput);
    this._list.addEventListener("scroll", this._onScroll, { passive: true });
    this._list.addEventListener("pointermove", this._onPointerMove);
    if (this._hotkey) document.addEventListener("keydown", this._onDocumentKeydown);
    if (Array.isArray(this._config.items)) this.setItems(this._config.items);
    else if (typeof this._config.items === "string") this.setItems(this._readItemsFromDOM(this._config.items));
  }
  /* --- Structure ---------------------------------------------------------- */
  _build() {
    this._element.innerHTML = TEMPLATE;
    this._backdrop = this._element.querySelector(".command-palette-backdrop");
    this._dialog = this._element.querySelector(".command-palette-dialog");
    this._input = this._element.querySelector(".command-palette-input");
    this._list = this._element.querySelector(".command-palette-list");
    this._canvas = this._element.querySelector(".command-palette-canvas");
    this._highlight = this._element.querySelector(".command-palette-highlight");
    this._empty = this._element.querySelector(".command-palette-empty");
    this._count = this._element.querySelector(".command-palette-count");
    this._list.id = `${this._id}-list`;
    this._input.id = `${this._id}-input`;
    this._input.placeholder = this._config.placeholder;
    this._input.setAttribute("aria-controls", this._list.id);
    this._empty.textContent = this._config.emptyText;
    if (!this._config.backdrop) this._backdrop.remove();
  }
  /** `data-ja-items="#some-json-script"` — items straight out of the page. */
  _readItemsFromDOM(selector) {
    const source = document.querySelector(selector);
    if (!source) return [];
    try {
      return JSON.parse(source.textContent);
    } catch {
      return [];
    }
  }
  /* --- Items -------------------------------------------------------------- */
  /**
   * Replace the item list. Strings are fine; objects take
   * `{ id, label, description, hint, group, icon, keywords, disabled, onSelect }`.
   * The lowercase haystack is built once here, not per keystroke.
   */
  setItems(items) {
    const source = Array.isArray(items) ? items : [];
    this._items = new Array(source.length);
    this._hasGroups = false;
    for (let i = 0; i < source.length; i += 1) {
      const raw = source[i];
      const item = typeof raw === "string" ? { label: raw } : { ...raw };
      const label = String(item.label ?? item.title ?? item.name ?? "");
      const extra = [item.keywords, item.description, item.group].flat().filter(Boolean).join(" ");
      item.label = label;
      item._text = extra ? `${label} ${extra}` : label;
      item._lower = item._text.toLowerCase();
      item._labelLength = label.length;
      if (item.group) this._hasGroups = true;
      this._items[i] = item;
    }
    this._lastQuery = null;
    this._lastMatches = null;
    if (this.isShown) this._refilter({ resetScroll: true });
    return this;
  }
  get items() {
    return this._items;
  }
  /** The item currently under the highlight, or null. */
  get activeItem() {
    const row = this._rows[this._active];
    return row && row.type === "item" ? row.item : null;
  }
  get isShown() {
    return this._element.classList.contains("show");
  }
  /* --- Show / hide -------------------------------------------------------- */
  toggle(relatedTarget) {
    return this.isShown ? this.hide() : this.show(relatedTarget);
  }
  show(relatedTarget = null) {
    if (this.isShown) return;
    if (typeof this._config.items === "function") this.setItems(this._config.items());
    if (!this._emit("show", { relatedTarget }, true)) return;
    lockScroll();
    const element = this._element;
    element.removeAttribute("aria-hidden");
    reflow(element);
    element.classList.add("show");
    this._pointerArmed = false;
    this._pointerAt = null;
    this._measure();
    this._input.value = this._query;
    this._refilter({ resetScroll: true });
    this._releaseFocus = trapFocus(element);
    this._input.focus();
    this._input.select();
    window.addEventListener("resize", this._onResize);
    document.addEventListener("keydown", this._onDocumentKeydown);
    onTransitionEnd(this._dialog, () => {
      if (this.isShown) this._emit("shown", { relatedTarget });
    });
  }
  hide() {
    if (!this.isShown) return;
    if (!this._emit("hide", {}, true)) return;
    this._element.classList.remove("show");
    unlockScroll();
    window.removeEventListener("resize", this._onResize);
    if (!this._hotkey) document.removeEventListener("keydown", this._onDocumentKeydown);
    this._releaseFocus?.();
    this._releaseFocus = null;
    if (this._config.clearOnClose) {
      this._query = "";
      this._input.value = "";
      this._lastQuery = null;
      this._lastMatches = null;
    }
    onTransitionEnd(this._dialog, () => {
      if (this.isShown) return;
      this._element.setAttribute("aria-hidden", "true");
      this._emit("hidden");
    });
  }
  /* --- Filtering ---------------------------------------------------------- */
  _handleInput() {
    this._query = this._input.value;
    this._refilter({ resetScroll: true });
  }
  /**
   * Re-rank against the current query.
   *
   * When the query only grew, the previous result set is a superset of the new
   * one, so only those candidates are re-scored. That is the difference
   * between a palette that keeps up with your typing on a huge list and one
   * that does not.
   */
  _refilter({ resetScroll = false } = {}) {
    const query = this._query.trim();
    const terms = parseQuery(query);
    const items = this._items;
    let matches;
    if (!terms.length) {
      matches = new Array(items.length);
      for (let i = 0; i < items.length; i += 1) matches[i] = { index: i, score: 0, positions: null };
    } else {
      const narrowing = this._lastMatches && this._lastQuery && query.startsWith(this._lastQuery) && this._lastQuery.length;
      const pool = narrowing ? this._lastMatches : null;
      const total = pool ? pool.length : items.length;
      matches = [];
      for (let i = 0; i < total; i += 1) {
        const index = pool ? pool[i].index : i;
        const item = items[index];
        const match = fuzzyMatch(item._text, terms, {
          lowerText: item._lower,
          primaryLength: item._labelLength
        });
        if (match) matches.push({ index, score: match.score, positions: match.positions });
      }
      matches.sort(
        (a, b) => b.score - a.score || items[a.index]._labelLength - items[b.index]._labelLength || a.index - b.index
      );
    }
    this._lastQuery = query;
    this._lastMatches = matches;
    this._matches = this._config.limit > 0 ? matches.slice(0, this._config.limit) : matches;
    this._layout();
    if (resetScroll) this._list.scrollTop = 0;
    this._render(true);
    this._setActive(this._firstSelectable(), { animate: false });
    this._updateCount(matches.length);
    this._emit("filter", { query, count: matches.length });
  }
  /** Flatten matches (plus group headers) into rows with absolute offsets. */
  _layout() {
    const rows = [];
    const grouped = this._config.groups && this._hasGroups && !this._query.trim();
    let top = 0;
    let group = null;
    for (let i = 0; i < this._matches.length; i += 1) {
      const match = this._matches[i];
      const item = this._items[match.index];
      if (grouped && item.group && item.group !== group) {
        group = item.group;
        rows.push({ type: "header", label: group, top, height: this._headerHeight });
        top += this._headerHeight;
      }
      rows.push({ type: "item", item, match, top, height: this._itemHeight });
      top += this._itemHeight;
    }
    this._rows = rows;
    this._canvas.style.blockSize = `${top}px`;
    this._empty.hidden = rows.length > 0;
    this._list.classList.toggle("is-empty", rows.length === 0);
    this._window = { start: -1, end: -1 };
  }
  _updateCount(total) {
    if (!this._count) return;
    const shown = this._matches.length;
    const all = this._items.length;
    this._count.textContent = total === all ? `${all}` : `${shown} of ${all}`;
  }
  /* --- Virtual rendering -------------------------------------------------- */
  /** Item and header heights come from CSS, so a re-skin stays in CSS. */
  _measure() {
    const styles = getComputedStyle(this._list);
    const item = parseFloat(styles.getPropertyValue("--ja-command-palette-item-height"));
    const header = parseFloat(styles.getPropertyValue("--ja-command-palette-header-height"));
    if (item > 0) this._itemHeight = item;
    if (header > 0) this._headerHeight = header;
    this._canvasOffset = this._canvas.offsetTop;
  }
  _scheduleRender() {
    if (this._frame) return;
    this._frame = requestAnimationFrame(() => {
      this._frame = 0;
      this._render();
    });
  }
  /** First row whose bottom edge is past `offset`. */
  _rowAt(offset) {
    const rows = this._rows;
    let low = 0;
    let high = rows.length - 1;
    let found = rows.length;
    while (low <= high) {
      const mid = low + high >> 1;
      if (rows[mid].top + rows[mid].height > offset) {
        found = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    return found;
  }
  _render(force = false) {
    const rows = this._rows;
    const scrollTop = this._list.scrollTop - this._canvasOffset;
    const viewport = this._list.clientHeight || 0;
    const overscan = this._config.overscan;
    const start = Math.max(0, this._rowAt(scrollTop) - overscan);
    const end = Math.min(rows.length, this._rowAt(scrollTop + viewport) + 1 + overscan);
    if (!force && start === this._window.start && end === this._window.end) return;
    this._window = { start, end };
    let items = 0;
    let headers = 0;
    for (let i = start; i < end; i += 1) {
      const row = rows[i];
      if (row.type === "header") this._paintHeader(this._headerElement(headers++), row);
      else this._paintItem(this._itemElement(items++), row, i);
    }
    for (let i = items; i < this._itemPool.length; i += 1) this._itemPool[i].hidden = true;
    for (let i = headers; i < this._headerPool.length; i += 1) this._headerPool[i].hidden = true;
  }
  _itemElement(slot) {
    let element = this._itemPool[slot];
    if (!element) {
      element = fromHTML(
        '<div class="command-palette-item" role="option"><span class="command-palette-item-icon" aria-hidden="true"></span><span class="command-palette-item-text"><span class="command-palette-item-label"></span><span class="command-palette-item-description"></span></span><span class="command-palette-item-meta"></span></div>'
      );
      element.refs = {
        icon: element.querySelector(".command-palette-item-icon"),
        label: element.querySelector(".command-palette-item-label"),
        description: element.querySelector(".command-palette-item-description"),
        meta: element.querySelector(".command-palette-item-meta")
      };
      this._canvas.append(element);
      this._itemPool[slot] = element;
    }
    element.hidden = false;
    return element;
  }
  _headerElement(slot) {
    let element = this._headerPool[slot];
    if (!element) {
      element = fromHTML('<div class="command-palette-header" role="presentation"></div>');
      this._canvas.append(element);
      this._headerPool[slot] = element;
    }
    element.hidden = false;
    return element;
  }
  _paintHeader(element, row) {
    element.style.translate = `0 ${row.top}px`;
    if (element.textContent !== row.label) element.textContent = row.label;
  }
  _paintItem(element, row, rowIndex) {
    const { item, match } = row;
    const refs = element.refs;
    element.style.translate = `0 ${row.top}px`;
    element.id = `${this._id}-opt-${rowIndex}`;
    element.dataset.row = String(rowIndex);
    element.classList.toggle("is-active", rowIndex === this._active);
    element.classList.toggle("is-disabled", Boolean(item.disabled));
    element.setAttribute("aria-selected", rowIndex === this._active ? "true" : "false");
    if (item.disabled) element.setAttribute("aria-disabled", "true");
    else element.removeAttribute("aria-disabled");
    const labelHtml = highlightLabel(item.label, match.positions);
    if (element._labelHtml !== labelHtml) {
      refs.label.innerHTML = labelHtml;
      element._labelHtml = labelHtml;
    }
    const description = item.description ?? "";
    if (refs.description.textContent !== description) refs.description.textContent = description;
    refs.description.hidden = !description;
    const icon = item.icon ?? "";
    if (element._iconHtml !== icon) {
      refs.icon.innerHTML = icon;
      element._iconHtml = icon;
    }
    refs.icon.hidden = !icon;
    const meta = item.hint ?? item.shortcut ?? (this._query.trim() ? item.group ?? "" : "");
    if (refs.meta.textContent !== meta) refs.meta.textContent = meta;
    refs.meta.hidden = !meta;
  }
  /* --- Selection ---------------------------------------------------------- */
  _isSelectable(row) {
    return row && row.type === "item" && !row.item.disabled;
  }
  _firstSelectable() {
    for (let i = 0; i < this._rows.length; i += 1) if (this._isSelectable(this._rows[i])) return i;
    return -1;
  }
  /**
   * Move the highlight. The block slides between rows; the list itself jumps,
   * because a smooth scroll racing an animating highlight is what makes a
   * held-down arrow key feel like mud.
   */
  _setActive(rowIndex, { animate = true, scroll = true } = {}) {
    const previous = this._active;
    this._active = rowIndex;
    if (previous !== rowIndex && previous >= 0) {
      const stale = this._canvas.querySelector(`[data-row="${previous}"]`);
      if (stale) {
        stale.classList.remove("is-active");
        stale.setAttribute("aria-selected", "false");
      }
    }
    const row = this._rows[rowIndex];
    if (!row) {
      this._highlight.classList.add("is-hidden");
      this._input.removeAttribute("aria-activedescendant");
      return;
    }
    if (scroll) this._scrollRowIntoView(rowIndex);
    const jump = !animate || prefersReducedMotion();
    if (jump) this._highlight.classList.add("is-instant");
    this._highlight.classList.remove("is-hidden");
    this._highlight.style.blockSize = `${row.height}px`;
    this._highlight.style.translate = `0 ${row.top}px`;
    if (jump) {
      reflow(this._highlight);
      this._highlight.classList.remove("is-instant");
    }
    this._input.setAttribute("aria-activedescendant", `${this._id}-opt-${rowIndex}`);
    this._render();
    const current = this._canvas.querySelector(`[data-row="${rowIndex}"]`);
    if (current) {
      current.classList.add("is-active");
      current.setAttribute("aria-selected", "true");
    }
    if (previous !== rowIndex) this._emit("highlight", { item: this.activeItem, index: rowIndex });
  }
  _scrollRowIntoView(rowIndex) {
    const row = this._rows[rowIndex];
    if (!row) return;
    const lead = this._rows[rowIndex - 1];
    const top = (lead && lead.type === "header" ? lead.top : row.top) + this._canvasOffset;
    const bottom = row.top + row.height + this._canvasOffset;
    const list = this._list;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  }
  /** Step `delta` selectable rows, wrapping at both ends like fzf. */
  _move(delta) {
    const rows = this._rows;
    if (!rows.length) return;
    let index = this._active;
    for (let step = 0; step < rows.length; step += 1) {
      index += delta;
      if (index < 0) index = rows.length - 1;
      else if (index >= rows.length) index = 0;
      if (this._isSelectable(rows[index])) {
        this._setActive(index);
        return;
      }
    }
  }
  _movePage(direction) {
    const perPage = Math.max(1, Math.floor(this._list.clientHeight / this._itemHeight) - 1);
    const target = Math.min(
      this._rows.length - 1,
      Math.max(0, this._active + direction * perPage)
    );
    let index = target;
    while (index >= 0 && index < this._rows.length && !this._isSelectable(this._rows[index])) {
      index += direction;
    }
    if (this._isSelectable(this._rows[index])) this._setActive(index);
    else this._move(direction);
  }
  _moveEdge(direction) {
    const rows = this._rows;
    const range = direction > 0 ? [rows.length - 1, -1, -1] : [0, rows.length, 1];
    for (let i = range[0]; i !== range[1]; i += range[2]) {
      if (this._isSelectable(rows[i])) {
        this._setActive(i);
        return;
      }
    }
  }
  /** Run the highlighted row. */
  select(event = null) {
    const row = this._rows[this._active];
    if (!this._isSelectable(row)) return false;
    const item = row.item;
    if (!this._emit("select", { item, index: row.match.index, query: this._query }, true)) return false;
    item.onSelect?.(item, event);
    this._config.onSelect?.(item, event);
    if (!this._config.keepOpen) this.hide();
    return true;
  }
  /* --- Events ------------------------------------------------------------- */
  _handleDocumentKeydown(event) {
    const inside = this.isShown && this._element.contains(event.target);
    if (!inside && this._hotkey && matchesHotkey(event, this._hotkey)) {
      event.preventDefault();
      this.toggle();
      return;
    }
    if (!this.isShown || !this._config.keyboard) return;
    if (event.key === "Escape" && !this._element.contains(event.target)) {
      event.preventDefault();
      this.hide();
    }
  }
  _handleKeydown(event) {
    const ctrl = event.ctrlKey && !event.metaKey && !event.altKey;
    const key = event.key;
    if (key === "Escape") {
      if (!this._config.keyboard) return;
      event.preventDefault();
      this.hide();
      return;
    }
    if (key === "Enter") {
      event.preventDefault();
      this.select(event);
      return;
    }
    let delta = 0;
    if (key === "ArrowDown" || ctrl && (key === "j" || key === "n")) delta = 1;
    else if (key === "ArrowUp" || ctrl && (key === "k" || key === "p")) delta = -1;
    if (delta) {
      event.preventDefault();
      this._disarmPointer();
      this._move(delta);
      return;
    }
    if (key === "PageDown" || ctrl && key === "d") {
      event.preventDefault();
      this._disarmPointer();
      this._movePage(1);
    } else if (key === "PageUp" || ctrl && key === "u") {
      event.preventDefault();
      this._disarmPointer();
      this._movePage(-1);
    } else if (key === "Home") {
      event.preventDefault();
      this._disarmPointer();
      this._moveEdge(-1);
    } else if (key === "End") {
      event.preventDefault();
      this._disarmPointer();
      this._moveEdge(1);
    }
  }
  _disarmPointer() {
    this._pointerArmed = false;
    this._pointerAt = null;
  }
  /**
   * Hover only takes the selection once the pointer has genuinely moved.
   * The first event after opening (or after a keystroke scrolled the list
   * under a resting cursor) is recorded and ignored.
   */
  _handlePointerMove(event) {
    const previous = this._pointerAt;
    this._pointerAt = { x: event.clientX, y: event.clientY };
    if (!this._pointerArmed) {
      if (!previous) return;
      if (Math.abs(event.clientX - previous.x) < 2 && Math.abs(event.clientY - previous.y) < 2) return;
      this._pointerArmed = true;
    }
    const element = event.target.closest?.(".command-palette-item");
    if (!element || element.classList.contains("is-disabled")) return;
    const rowIndex = Number(element.dataset.row);
    if (rowIndex !== this._active) this._setActive(rowIndex, { scroll: false });
  }
  _handleClick(event) {
    const element = event.target.closest?.(".command-palette-item");
    if (element) {
      if (element.classList.contains("is-disabled")) return;
      const rowIndex = Number(element.dataset.row);
      if (rowIndex !== this._active) this._setActive(rowIndex, { animate: false, scroll: false });
      this.select(event);
      return;
    }
    if (this._config.backdrop && !this._dialog.contains(event.target)) this.hide();
  }
  dispose() {
    if (this._frame) cancelAnimationFrame(this._frame);
    window.removeEventListener("resize", this._onResize);
    document.removeEventListener("keydown", this._onDocumentKeydown);
    this._element.removeEventListener("keydown", this._onKeydown);
    this._element.removeEventListener("click", this._onClick);
    this._releaseFocus?.({ restoreFocus: false });
    if (this.isShown) unlockScroll();
    super.dispose();
  }
};
function highlightLabel(label, positions) {
  if (!positions || !positions.length) return escapeHtml(label);
  let html = "";
  let cursor = 0;
  for (let i = 0; i < positions.length; ) {
    const start = positions[i];
    let end = start + 1;
    while (i + 1 < positions.length && positions[i + 1] === end) {
      end += 1;
      i += 1;
    }
    i += 1;
    html += escapeHtml(label.slice(cursor, start));
    html += `<mark>${escapeHtml(label.slice(start, end))}</mark>`;
    cursor = end;
  }
  return html + escapeHtml(label.slice(cursor));
}

// src/js/datatable.js
var TEMPLATE2 = `
  <div class="datatable-shell">
    <div class="datatable-corner" role="button" aria-label="Select all cells" tabindex="0">
      <span class="datatable-corner-mark" aria-hidden="true"></span>
      <span class="datatable-resize-handle" data-role="all-handle" aria-hidden="true"></span>
    </div>
    <div class="datatable-header-layer" aria-hidden="true"></div>
    <div class="datatable-gutter-layer" aria-hidden="true"></div>
    <div class="datatable-viewport" tabindex="0" role="grid">
      <div class="datatable-canvas"></div>
    </div>
  </div>
  <div class="datatable-measurer" aria-hidden="true">
    <div class="datatable-header-cell datatable-measure-cell"><span class="datatable-label"></span></div>
    <div class="datatable-cell datatable-measure-cell"><span class="datatable-label"></span></div>
  </div>
`;
var clamp = (value, min, max = Infinity) => Math.max(min, Math.min(max, value));
var finiteNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};
var columnLabel = (column, index) => {
  if (typeof column === "string") return column;
  return String(column?.label ?? column?.name ?? column?.title ?? column?.key ?? `Column ${index + 1}`);
};
var columnKey = (column, index) => {
  if (typeof column === "string") return column;
  return column?.key ?? column?.field ?? column?.id ?? index;
};
var parseJsonSource = (value) => {
  if (typeof value !== "string" || !value.startsWith("#") || typeof document === "undefined") return value;
  const source = document.querySelector(value);
  if (!source) return null;
  try {
    return JSON.parse(source.textContent);
  } catch {
    return null;
  }
};
var DataTable = class extends Component {
  static NAME = "datatable";
  static Default = {
    columns: null,
    rows: null,
    columnCount: 0,
    rowCount: 0,
    defaultColumnWidth: 192,
    minColumnWidth: 72,
    maxAutoWidth: 512,
    autoSizeSample: 48,
    rowHeight: 40,
    headerHeight: 44,
    gutterWidth: 56,
    overscan: 2,
    selectable: true,
    getColumnLabel: null,
    getCell: null,
    getRow: null
  };
  constructor(element, config) {
    super(element, config);
    this._element.classList.add("datatable");
    this._element.innerHTML = TEMPLATE2;
    this._shell = this._element.querySelector(".datatable-shell");
    this._corner = this._element.querySelector(".datatable-corner");
    this._headerLayer = this._element.querySelector(".datatable-header-layer");
    this._gutterLayer = this._element.querySelector(".datatable-gutter-layer");
    this._viewport = this._element.querySelector(".datatable-viewport");
    this._canvas = this._element.querySelector(".datatable-canvas");
    this._measurer = this._element.querySelector(".datatable-measurer");
    this._measureHeader = this._measurer.children[0];
    this._measureCell = this._measurer.children[1];
    this._headerPool = [];
    this._gutterPool = [];
    this._cellPool = [];
    this._frame = 0;
    this._renderState = { rowStart: -1, rowEnd: -1, colStart: -1, colEnd: -1, width: -1, height: -1 };
    this._selectedAll = false;
    this._resize = null;
    this._pendingWidth = 0;
    this._measureContext = void 0;
    this._metrics = null;
    this._widthFrame = 0;
    this._onScroll = () => this._scheduleRender();
    this._onResize = () => this._scheduleRender(true);
    this._onClick = this._handleClick.bind(this);
    this._onKeydown = this._handleKeydown.bind(this);
    this._onDoubleClick = this._handleDoubleClick.bind(this);
    this._onPointerDown = this._handlePointerDown.bind(this);
    this._onPointerMove = this._handlePointerMove.bind(this);
    this._onPointerUp = this._handlePointerUp.bind(this);
    this._viewport.addEventListener("scroll", this._onScroll, { passive: true });
    this._element.addEventListener("click", this._onClick);
    this._element.addEventListener("keydown", this._onKeydown);
    this._element.addEventListener("dblclick", this._onDoubleClick);
    this._element.addEventListener("pointerdown", this._onPointerDown);
    window.addEventListener("resize", this._onResize);
    this._setData(this._config);
  }
  get rowCount() {
    return this._rowCount;
  }
  get columnCount() {
    return this._columnCount;
  }
  get selectedAll() {
    return this._selectedAll;
  }
  setData(config = {}) {
    this._config = { ...this._config, ...config };
    this._setData(this._config);
    return this;
  }
  resizeColumn(index, width, { silent = false } = {}) {
    if (index < 0 || index >= this._columnCount) return this;
    const next = Math.max(this._minColumnWidth, Math.round(width));
    if (this._columnWidths[index] === next) return this;
    if (!silent && !this._emit("columnresize", { column: index, width: next }, true)) return this;
    this._columnWidths[index] = next;
    this._rebuildOffsets(index);
    this._syncGeometry();
    this._scheduleRender(true);
    if (!silent) this._emit("columnresized", { column: index, width: next });
    return this;
  }
  autoSizeColumn(index) {
    if (index < 0 || index >= this._columnCount) return this;
    this._primeMetrics();
    const width = this._measureColumn(index);
    return this.resizeColumn(index, width);
  }
  autoSizeAll() {
    if (!this._emit("autosize", { columns: this._columnCount }, true)) return this;
    this._primeMetrics();
    for (let i = 0; i < this._columnCount; i += 1) {
      this._columnWidths[i] = this._measureColumn(i);
    }
    this._rebuildOffsets(0);
    this._syncGeometry();
    this._scheduleRender(true);
    this._emit("autosized", { columns: this._columnCount });
    return this;
  }
  selectAll(selected = true) {
    if (this._selectedAll === selected) return this;
    if (!this._emit("selectall", { selected }, true)) return this;
    this._selectedAll = selected;
    this._element.classList.toggle("is-table-selected", selected);
    this._corner.setAttribute("aria-pressed", selected ? "true" : "false");
    this._scheduleRender(true);
    this._emit("selectallchanged", { selected });
    return this;
  }
  dispose() {
    this._viewport.removeEventListener("scroll", this._onScroll);
    this._element.removeEventListener("click", this._onClick);
    this._element.removeEventListener("keydown", this._onKeydown);
    this._element.removeEventListener("dblclick", this._onDoubleClick);
    this._element.removeEventListener("pointerdown", this._onPointerDown);
    window.removeEventListener("resize", this._onResize);
    this._stopResize();
    cancelAnimationFrame(this._frame);
    cancelAnimationFrame(this._widthFrame);
    super.dispose();
  }
  _setData(config) {
    const columns = parseJsonSource(config.columns);
    const rows = parseJsonSource(config.rows);
    this._columns = Array.isArray(columns) ? columns : null;
    this._rows = Array.isArray(rows) ? rows : null;
    this._columnCount = this._columns?.length ?? finiteNumber(config.columnCount, 0);
    this._rowCount = this._rows?.length ?? finiteNumber(config.rowCount, 0);
    if (!this._columnCount && Array.isArray(this._rows?.[0])) this._columnCount = this._rows[0].length;
    this._getRow = typeof config.getRow === "function" ? config.getRow : (index) => this._rows?.[index];
    this._getCell = typeof config.getCell === "function" ? config.getCell : (rowIndex, columnIndex, row, column) => {
      if (Array.isArray(row)) return row[columnIndex];
      if (row && typeof row === "object") return row[columnKey(column, columnIndex)];
      return "";
    };
    this._getColumnLabel = typeof config.getColumnLabel === "function" ? config.getColumnLabel : (index, column) => columnLabel(column, index);
    this._defaultColumnWidth = Math.max(1, finiteNumber(config.defaultColumnWidth, 192));
    this._minColumnWidth = Math.max(24, finiteNumber(config.minColumnWidth, 72));
    this._maxAutoWidth = Math.max(this._minColumnWidth, finiteNumber(config.maxAutoWidth, 512));
    this._autoSizeSample = Math.max(1, finiteNumber(config.autoSizeSample, 48));
    this._rowHeight = Math.max(20, finiteNumber(config.rowHeight, 40));
    this._headerHeight = Math.max(24, finiteNumber(config.headerHeight, 44));
    this._gutterWidth = Math.max(28, finiteNumber(config.gutterWidth, 56));
    this._overscan = Math.max(0, finiteNumber(config.overscan, 2));
    this._selectable = config.selectable !== false;
    this._columnWidths = new Float64Array(this._columnCount);
    this._columnOffsets = new Float64Array(this._columnCount + 1);
    for (let i = 0; i < this._columnCount; i += 1) {
      const width = this._columns?.[i]?.width;
      this._columnWidths[i] = Math.max(this._minColumnWidth, Number(width) || this._defaultColumnWidth);
    }
    this._rebuildOffsets(0);
    this._syncGeometry();
    this._selectedAll = false;
    this._element.classList.remove("is-table-selected");
    this._corner.setAttribute("aria-pressed", "false");
    this._scheduleRender(true);
  }
  _syncGeometry() {
    this._totalWidth = this._columnOffsets[this._columnCount];
    this._totalHeight = this._rowCount * this._rowHeight;
    this._canvas.style.inlineSize = `${this._gutterWidth + this._totalWidth}px`;
    this._canvas.style.blockSize = `${this._headerHeight + this._totalHeight}px`;
    this._element.style.setProperty("--ja-datatable-row-height", `${this._rowHeight}px`);
    this._element.style.setProperty("--ja-datatable-header-height", `${this._headerHeight}px`);
    this._element.style.setProperty("--ja-datatable-gutter-width", `${this._gutterWidth}px`);
    this._element.style.setProperty("--ja-datatable-max-auto-width", `${this._maxAutoWidth}px`);
    this._viewport.setAttribute("aria-rowcount", String(this._rowCount + 1));
    this._viewport.setAttribute("aria-colcount", String(this._columnCount + 1));
    this._corner.style.inlineSize = `${this._gutterWidth}px`;
    this._corner.style.blockSize = `${this._headerHeight}px`;
    this._corner.setAttribute("aria-pressed", this._selectedAll ? "true" : "false");
    this._headerLayer.style.insetInlineStart = `${this._gutterWidth}px`;
    this._headerLayer.style.blockSize = `${this._headerHeight}px`;
    this._gutterLayer.style.insetBlockStart = `${this._headerHeight}px`;
    this._gutterLayer.style.inlineSize = `${this._gutterWidth}px`;
  }
  _rebuildOffsets(from) {
    const start = Math.max(0, from);
    if (start === 0) this._columnOffsets[0] = 0;
    for (let i = Math.max(0, start); i < this._columnCount; i += 1) {
      this._columnOffsets[i + 1] = this._columnOffsets[i] + this._columnWidths[i];
    }
  }
  _scheduleRender(force = false) {
    this._needsFullRender ||= force;
    if (this._frame) return;
    this._frame = requestAnimationFrame(() => {
      this._frame = 0;
      this._render(this._needsFullRender);
      this._needsFullRender = false;
    });
  }
  _columnAt(offset) {
    let low = 0;
    let high = this._columnCount - 1;
    let found = this._columnCount;
    while (low <= high) {
      const mid = low + high >> 1;
      if (this._columnOffsets[mid + 1] > offset) {
        found = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    return found;
  }
  _render(force = false) {
    const viewportWidth = this._viewport.clientWidth || 0;
    const viewportHeight = this._viewport.clientHeight || 0;
    const scrollLeft = this._viewport.scrollLeft;
    const scrollTop = this._viewport.scrollTop;
    const colStart = Math.max(0, this._columnAt(Math.max(0, scrollLeft - this._gutterWidth)) - this._overscan);
    const colEnd = Math.min(
      this._columnCount,
      this._columnAt(Math.max(0, scrollLeft + viewportWidth - this._gutterWidth)) + 1 + this._overscan
    );
    const rowStart = Math.max(0, Math.floor(Math.max(0, scrollTop - this._headerHeight) / this._rowHeight) - this._overscan);
    const rowEnd = Math.min(
      this._rowCount,
      Math.ceil(Math.max(0, scrollTop + viewportHeight - this._headerHeight) / this._rowHeight) + this._overscan
    );
    const state = this._renderState;
    if (!force && rowStart === state.rowStart && rowEnd === state.rowEnd && colStart === state.colStart && colEnd === state.colEnd && viewportWidth === state.width && viewportHeight === state.height) {
      return;
    }
    this._renderState = { rowStart, rowEnd, colStart, colEnd, width: viewportWidth, height: viewportHeight };
    this._paintHeaders(colStart, colEnd, scrollLeft);
    this._paintGutter(rowStart, rowEnd, scrollTop);
    this._paintCells(rowStart, rowEnd, colStart, colEnd);
  }
  _paintHeaders(colStart, colEnd, scrollLeft) {
    let used = 0;
    for (let col = colStart; col < colEnd; col += 1) {
      const element = this._headerElement(used++);
      const width = this._columnWidths[col];
      const x = this._columnOffsets[col] - scrollLeft;
      element.dataset.col = String(col);
      element.style.transform = `translate(${x}px, 0)`;
      element.style.inlineSize = `${width}px`;
      const label = this._getColumnLabel(col, this._columns?.[col]);
      if (element._label !== label) {
        element.refs.label.textContent = label;
        element._label = label;
      }
      element.classList.toggle("is-selected", this._selectedAll);
    }
    for (let i = used; i < this._headerPool.length; i += 1) this._headerPool[i].hidden = true;
  }
  _paintGutter(rowStart, rowEnd, scrollTop) {
    let used = 0;
    for (let row = rowStart; row < rowEnd; row += 1) {
      const element = this._gutterElement(used++);
      const y = row * this._rowHeight - scrollTop;
      element.dataset.row = String(row);
      element.style.transform = `translate(0, ${y}px)`;
      element.textContent = String(row + 1);
      element.classList.toggle("is-selected", this._selectedAll);
    }
    for (let i = used; i < this._gutterPool.length; i += 1) this._gutterPool[i].hidden = true;
  }
  _paintCells(rowStart, rowEnd, colStart, colEnd) {
    let used = 0;
    for (let rowIndex = rowStart; rowIndex < rowEnd; rowIndex += 1) {
      const row = this._getRow(rowIndex);
      const y = this._headerHeight + rowIndex * this._rowHeight;
      for (let colIndex = colStart; colIndex < colEnd; colIndex += 1) {
        const element = this._cellElement(used++);
        const x = this._gutterWidth + this._columnOffsets[colIndex];
        const width = this._columnWidths[colIndex];
        element.dataset.row = String(rowIndex);
        element.dataset.col = String(colIndex);
        element.style.transform = `translate(${x}px, ${y}px)`;
        element.style.inlineSize = `${width}px`;
        const value = this._cellText(rowIndex, colIndex, row, this._columns?.[colIndex]);
        if (element._value !== value) {
          element.textContent = value;
          element._value = value;
        }
        element.classList.toggle("is-selected", this._selectedAll);
      }
    }
    for (let i = used; i < this._cellPool.length; i += 1) this._cellPool[i].hidden = true;
  }
  _headerElement(slot) {
    let element = this._headerPool[slot];
    if (!element) {
      element = fromHTML(
        '<div class="datatable-header-cell" role="columnheader"><span class="datatable-label"></span><span class="datatable-resize-handle" data-role="col-handle" aria-hidden="true"></span></div>'
      );
      element.refs = { label: element.querySelector(".datatable-label") };
      this._headerLayer.append(element);
      this._headerPool[slot] = element;
    }
    element.hidden = false;
    return element;
  }
  _gutterElement(slot) {
    let element = this._gutterPool[slot];
    if (!element) {
      element = fromHTML('<div class="datatable-gutter-cell" role="rowheader"></div>');
      this._gutterLayer.append(element);
      this._gutterPool[slot] = element;
    }
    element.hidden = false;
    return element;
  }
  _cellElement(slot) {
    let element = this._cellPool[slot];
    if (!element) {
      element = fromHTML('<div class="datatable-cell" role="gridcell"></div>');
      this._canvas.append(element);
      this._cellPool[slot] = element;
    }
    element.hidden = false;
    return element;
  }
  _cellText(rowIndex, columnIndex, row, column) {
    const value = this._getCell(rowIndex, columnIndex, row, column);
    if (value == null) return "";
    return typeof value === "string" ? value : String(value);
  }
  _handleClick(event) {
    const corner = event.target.closest(".datatable-corner");
    if (!corner || !this._selectable) return;
    event.preventDefault();
    this.selectAll(!this._selectedAll);
  }
  _handleKeydown(event) {
    if (!this._selectable) return;
    if (!event.target.closest(".datatable-corner")) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    this.selectAll(!this._selectedAll);
  }
  _handleDoubleClick(event) {
    const handle = event.target.closest(".datatable-resize-handle");
    if (handle?.dataset.role === "all-handle") {
      if (this._selectedAll) {
        event.preventDefault();
        this.autoSizeAll();
      }
      return;
    }
    if (handle?.dataset.role === "col-handle") {
      const header2 = handle.closest(".datatable-header-cell");
      const index2 = Number(header2?.dataset.col);
      if (Number.isInteger(index2)) {
        event.preventDefault();
        this.autoSizeColumn(index2);
      }
      return;
    }
    const header = event.target.closest(".datatable-header-cell");
    const index = Number(header?.dataset.col);
    if (Number.isInteger(index)) {
      event.preventDefault();
      this.autoSizeColumn(index);
    }
  }
  _handlePointerDown(event) {
    const handle = event.target.closest('.datatable-resize-handle[data-role="col-handle"]');
    if (!handle) return;
    const header = handle.closest(".datatable-header-cell");
    const index = Number(header?.dataset.col);
    if (!Number.isInteger(index)) return;
    event.preventDefault();
    this._resize = {
      column: index,
      startX: event.clientX,
      startWidth: this._columnWidths[index]
    };
    this._pendingWidth = this._columnWidths[index];
    this._element.classList.add("is-resizing");
    window.addEventListener("pointermove", this._onPointerMove);
    window.addEventListener("pointerup", this._onPointerUp, { once: true });
  }
  _handlePointerMove(event) {
    if (!this._resize) return;
    this._pendingWidth = this._resize.startWidth + (event.clientX - this._resize.startX);
    if (this._widthFrame) return;
    this._widthFrame = requestAnimationFrame(() => {
      this._widthFrame = 0;
      if (!this._resize) return;
      this.resizeColumn(this._resize.column, this._pendingWidth, { silent: true });
    });
  }
  _handlePointerUp() {
    if (!this._resize) return;
    cancelAnimationFrame(this._widthFrame);
    this._widthFrame = 0;
    const { column } = this._resize;
    this.resizeColumn(column, this._pendingWidth, { silent: true });
    const width = this._columnWidths[column];
    this._stopResize();
    this._emit("columnresized", { column, width });
  }
  _stopResize() {
    window.removeEventListener("pointermove", this._onPointerMove);
    window.removeEventListener("pointerup", this._onPointerUp);
    this._resize = null;
    this._element.classList.remove("is-resizing");
  }
  _sampleRows() {
    if (this._rowCount <= 0) return [];
    const rows = /* @__PURE__ */ new Set();
    const { rowStart, rowEnd } = this._renderState;
    for (let i = rowStart; i < rowEnd; i += 1) rows.add(i);
    if (rows.size >= this._autoSizeSample) return [...rows].slice(0, this._autoSizeSample);
    for (let i = 0; i < this._rowCount && rows.size < this._autoSizeSample; i += 1) rows.add(i);
    if (this._rowCount <= this._autoSizeSample) return [...rows];
    const last = this._rowCount - 1;
    for (let i = 0; rows.size < this._autoSizeSample; i += 1) {
      const ratio = this._autoSizeSample === 1 ? 0 : i / (this._autoSizeSample - 1);
      rows.add(Math.round(ratio * last));
    }
    return [...rows];
  }
  _measureColumn(index) {
    const column = this._columns?.[index];
    const limit = Math.min(this._maxAutoWidth, Number(column?.maxWidth) || this._maxAutoWidth);
    let width = this._measureText(this._measureHeader, this._getColumnLabel(index, column));
    const rows = this._sampleRows();
    for (let i = 0; i < rows.length; i += 1) {
      const rowIndex = rows[i];
      const row = this._getRow(rowIndex);
      width = Math.max(width, this._measureText(this._measureCell, this._cellText(rowIndex, index, row, column)));
      if (width >= limit) return limit;
    }
    return clamp(width, this._minColumnWidth, limit);
  }
  /**
   * Read the font and the cell chrome once per auto-size pass.
   *
   * Auto-sizing a thousand columns means measuring tens of thousands of
   * strings. Doing that by writing textContent and reading scrollWidth is a
   * forced synchronous layout per string, which is what makes Excel-style
   * "fit every column" feel broken. A canvas measures the same text with no
   * layout at all, so the pass is arithmetic once these are known.
   */
  _primeMetrics() {
    this._metrics = null;
    if (!this._element.isConnected) return;
    if (this._measureContext === void 0) {
      this._measureContext = document.createElement("canvas").getContext("2d") ?? null;
    }
    if (!this._measureContext) return;
    const read2 = (element) => {
      const styles = getComputedStyle(element);
      const chrome = parseFloat(styles.paddingInlineStart) + parseFloat(styles.paddingInlineEnd) + parseFloat(styles.borderInlineStartWidth) + parseFloat(styles.borderInlineEndWidth);
      return {
        font: styles.font || `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`,
        letterSpacing: styles.letterSpacing,
        chrome: Number.isFinite(chrome) ? chrome : 0
      };
    };
    const header = read2(this._measureHeader);
    const cell = read2(this._measureCell);
    if (!header.font || !cell.font) return;
    this._metrics = /* @__PURE__ */ new Map([
      [this._measureHeader, header],
      [this._measureCell, cell]
    ]);
  }
  _measureText(element, text) {
    const metrics = this._metrics?.get(element);
    if (metrics) {
      const context = this._measureContext;
      context.font = metrics.font;
      if ("letterSpacing" in context) context.letterSpacing = metrics.letterSpacing;
      return Math.ceil(context.measureText(text).width + metrics.chrome);
    }
    element.firstElementChild.textContent = text;
    return Math.ceil(element.scrollWidth);
  }
};

// src/js/dropdown.js
var ARROW_KEYS = /* @__PURE__ */ new Set(["ArrowUp", "ArrowDown", "Home", "End"]);
var openDropdown = null;
var Dropdown = class extends Component {
  static NAME = "dropdown";
  static Default = {
    /** Close when a menu item is clicked. */
    autoClose: true
  };
  constructor(element, config) {
    super(element, config);
    this._parent = this._element.closest(".dropdown, .dropup, .dropend, .dropstart, .btn-group");
    this._menu = this._parent?.querySelector(".dropdown-menu") ?? null;
    this._onKeydown = this._handleKeydown.bind(this);
    this._element.setAttribute("aria-expanded", "false");
    if (this._menu && !this._element.hasAttribute("aria-haspopup")) {
      this._element.setAttribute("aria-haspopup", "true");
    }
  }
  get isShown() {
    return Boolean(this._menu?.classList.contains("show"));
  }
  toggle() {
    return this.isShown ? this.hide() : this.show();
  }
  show() {
    if (!this._menu || this.isShown) return;
    if (!this._emit("show", {}, true)) return;
    openDropdown?.hide();
    openDropdown = this;
    this._menu.classList.add("show");
    this._element.setAttribute("aria-expanded", "true");
    this._element.classList.add("show");
    this._flipIfClipped();
    document.addEventListener("keydown", this._onKeydown);
    this._emit("shown");
  }
  hide() {
    if (!this._menu || !this.isShown) return;
    if (!this._emit("hide", {}, true)) return;
    this._menu.classList.remove("show");
    this._menu.removeAttribute("data-ja-placement");
    this._element.setAttribute("aria-expanded", "false");
    this._element.classList.remove("show");
    document.removeEventListener("keydown", this._onKeydown);
    if (openDropdown === this) openDropdown = null;
    this._emit("hidden");
  }
  /** Nudge the menu above / to the other side when it would overflow. */
  _flipIfClipped() {
    const rect = this._menu.getBoundingClientRect();
    const flipUp = rect.bottom > window.innerHeight && rect.top > rect.height;
    const flipEnd = rect.right > window.innerWidth;
    const placement = `${flipUp ? "top" : "bottom"}-${flipEnd ? "end" : "start"}`;
    this._menu.dataset.jaPlacement = placement;
  }
  _items() {
    return [...this._menu.querySelectorAll(".dropdown-item:not(.disabled):not(:disabled)")];
  }
  _handleKeydown(event) {
    if (event.key === "Escape") {
      this.hide();
      this._element.focus();
      return;
    }
    if (event.key === "Tab" && !this._parent.contains(event.target)) {
      this.hide();
      return;
    }
    if (!ARROW_KEYS.has(event.key)) return;
    event.preventDefault();
    const items = this._items();
    if (!items.length) return;
    const index = items.indexOf(document.activeElement);
    let next = 0;
    if (event.key === "ArrowDown") next = index < 0 ? 0 : (index + 1) % items.length;
    else if (event.key === "ArrowUp") next = index <= 0 ? items.length - 1 : index - 1;
    else if (event.key === "End") next = items.length - 1;
    items[next].focus();
  }
  dispose() {
    document.removeEventListener("keydown", this._onKeydown);
    if (openDropdown === this) openDropdown = null;
    super.dispose();
  }
  /** Close any open dropdown — used by the global click handler. */
  static closeAll(exceptTarget = null) {
    if (!openDropdown) return;
    if (exceptTarget && openDropdown._parent?.contains(exceptTarget)) return;
    openDropdown.hide();
  }
};
function initDropdownDismiss() {
  document.addEventListener("click", (event) => {
    const inMenu = event.target.closest?.(".dropdown-menu");
    if (inMenu && openDropdown && openDropdown._config.autoClose) {
      if (event.target.closest(".dropdown-item")) openDropdown.hide();
      return;
    }
    Dropdown.closeAll(event.target);
  });
}

// src/js/modal.js
var openModals = [];
var Modal = class extends Component {
  static NAME = "modal";
  static Default = {
    /** true | false | 'static' */
    backdrop: true,
    /** Close on Escape. */
    keyboard: true,
    /** Move focus into the dialog when it opens. */
    focus: true
  };
  constructor(element, config) {
    super(element, config);
    this._backdrop = null;
    this._releaseFocus = null;
    this._isTransitioning = false;
    this._onKeydown = this._handleKeydown.bind(this);
    this._onClick = this._handleClick.bind(this);
    this._element.setAttribute("tabindex", "-1");
    if (!this._element.hasAttribute("role")) this._element.setAttribute("role", "dialog");
    this._element.setAttribute("aria-modal", "true");
  }
  get isShown() {
    return this._element.classList.contains("show");
  }
  toggle(relatedTarget) {
    return this.isShown ? this.hide() : this.show(relatedTarget);
  }
  show(relatedTarget = null) {
    if (this.isShown || this._isTransitioning) return;
    if (!this._emit("show", { relatedTarget }, true)) return;
    this._isTransitioning = true;
    openModals.push(this);
    lockScroll();
    this._showBackdrop();
    const element = this._element;
    element.style.display = "block";
    element.removeAttribute("aria-hidden");
    reflow(element);
    element.classList.add("show");
    element.addEventListener("click", this._onClick);
    document.addEventListener("keydown", this._onKeydown);
    onTransitionEnd(element.querySelector(".modal-dialog") ?? element, () => {
      this._isTransitioning = false;
      if (this._config.focus) {
        this._releaseFocus = trapFocus(element);
        const [first] = getFocusable(element);
        (first ?? element).focus();
      }
      this._emit("shown", { relatedTarget });
    });
  }
  hide() {
    if (!this.isShown || this._isTransitioning) return;
    if (!this._emit("hide", {}, true)) return;
    this._isTransitioning = true;
    const element = this._element;
    element.classList.remove("show");
    element.removeEventListener("click", this._onClick);
    document.removeEventListener("keydown", this._onKeydown);
    this._hideBackdrop();
    onTransitionEnd(element.querySelector(".modal-dialog") ?? element, () => {
      element.style.display = "none";
      element.setAttribute("aria-hidden", "true");
      this._releaseFocus?.();
      this._releaseFocus = null;
      const index = openModals.indexOf(this);
      if (index > -1) openModals.splice(index, 1);
      unlockScroll();
      this._isTransitioning = false;
      this._emit("hidden");
    });
  }
  _showBackdrop() {
    if (!this._config.backdrop) return;
    this._backdrop = fromHTML('<div class="modal-backdrop"></div>');
    document.body.append(this._backdrop);
    reflow(this._backdrop);
    this._backdrop.classList.add("show");
  }
  _hideBackdrop() {
    const backdrop = this._backdrop;
    if (!backdrop) return;
    this._backdrop = null;
    backdrop.classList.remove("show");
    onTransitionEnd(backdrop, () => backdrop.remove());
  }
  _handleClick(event) {
    if (event.target !== this._element) return;
    if (this._config.backdrop === "static") {
      this._nudge();
      return;
    }
    if (this._config.backdrop) this.hide();
  }
  _handleKeydown(event) {
    if (event.key !== "Escape") return;
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
    const dialog = this._element.querySelector(".modal-dialog");
    if (!dialog) return;
    dialog.animate(
      [
        { translate: "0 0" },
        { translate: "-8px 0" },
        { translate: "8px 0" },
        { translate: "-4px 0" },
        { translate: "0 0" }
      ],
      { duration: 220, easing: "steps(5, end)" }
    );
  }
  dispose() {
    document.removeEventListener("keydown", this._onKeydown);
    this._element.removeEventListener("click", this._onClick);
    this._releaseFocus?.({ restoreFocus: false });
    super.dispose();
  }
};

// src/js/offcanvas.js
var Offcanvas = class extends Component {
  static NAME = "offcanvas";
  static Default = {
    backdrop: true,
    keyboard: true,
    /** Keep the page scrollable while the drawer is open. */
    scroll: false
  };
  constructor(element, config) {
    super(element, config);
    this._backdrop = null;
    this._releaseFocus = null;
    this._onKeydown = this._handleKeydown.bind(this);
    this._element.setAttribute("tabindex", "-1");
  }
  get isShown() {
    return this._element.classList.contains("show");
  }
  toggle(relatedTarget) {
    return this.isShown ? this.hide() : this.show(relatedTarget);
  }
  show(relatedTarget = null) {
    if (this.isShown) return;
    if (!this._emit("show", { relatedTarget }, true)) return;
    if (!this._config.scroll) lockScroll();
    if (this._config.backdrop) {
      this._backdrop = fromHTML('<div class="offcanvas-backdrop"></div>');
      this._backdrop.addEventListener("click", () => this.hide());
      document.body.append(this._backdrop);
      reflow(this._backdrop);
      this._backdrop.classList.add("show");
    }
    const element = this._element;
    element.classList.add("showing");
    reflow(element);
    element.classList.add("show");
    document.addEventListener("keydown", this._onKeydown);
    onTransitionEnd(element, () => {
      element.classList.remove("showing");
      this._releaseFocus = trapFocus(element);
      const [first] = getFocusable(element);
      (first ?? element).focus();
      this._emit("shown", { relatedTarget });
    });
  }
  hide() {
    if (!this.isShown) return;
    if (!this._emit("hide", {}, true)) return;
    const element = this._element;
    element.classList.remove("show");
    document.removeEventListener("keydown", this._onKeydown);
    const backdrop = this._backdrop;
    this._backdrop = null;
    backdrop?.classList.remove("show");
    onTransitionEnd(element, () => {
      backdrop?.remove();
      this._releaseFocus?.();
      this._releaseFocus = null;
      if (!this._config.scroll) unlockScroll();
      this._emit("hidden");
    });
  }
  _handleKeydown(event) {
    if (event.key === "Escape" && this._config.keyboard) {
      event.preventDefault();
      this.hide();
    }
  }
  dispose() {
    document.removeEventListener("keydown", this._onKeydown);
    this._releaseFocus?.({ restoreFocus: false });
    super.dispose();
  }
};

// src/js/tab.js
var Tab = class _Tab extends Component {
  static NAME = "tab";
  constructor(element, config) {
    super(element, config);
    this._onKeydown = this._handleKeydown.bind(this);
    this._element.addEventListener("keydown", this._onKeydown);
  }
  get _list() {
    return this._element.closest(".nav, .list-group");
  }
  show() {
    const trigger = this._element;
    if (trigger.classList.contains("active") || trigger.classList.contains("disabled")) return;
    const pane = getTargetElement(trigger);
    const list = this._list;
    const previous = list?.querySelector(".active");
    if (!this._emit("show", { relatedTarget: previous }, true)) return;
    if (previous) {
      previous.classList.remove("active");
      previous.setAttribute("aria-selected", "false");
      previous.setAttribute("tabindex", "-1");
    }
    trigger.classList.add("active");
    trigger.setAttribute("aria-selected", "true");
    trigger.removeAttribute("tabindex");
    if (!pane) {
      this._emit("shown", { relatedTarget: previous });
      return;
    }
    const container = pane.parentElement;
    const currentPane = container?.querySelector(".tab-pane.active");
    if (currentPane && currentPane !== pane) {
      currentPane.classList.remove("active", "show");
    }
    pane.classList.add("active");
    reflow(pane);
    pane.classList.add("show");
    onTransitionEnd(pane, () => this._emit("shown", { relatedTarget: previous }));
  }
  _handleKeydown(event) {
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const list = this._list;
    if (!list) return;
    const triggers = [...list.querySelectorAll('[data-ja-toggle="tab"]:not(.disabled)')];
    const index = triggers.indexOf(this._element);
    if (index < 0) return;
    event.preventDefault();
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = triggers.length - 1;
    else next = (index + (forward ? 1 : -1) + triggers.length) % triggers.length;
    triggers[next].focus();
    _Tab.getOrCreateInstance(triggers[next]).show();
  }
  dispose() {
    this._element.removeEventListener("keydown", this._onKeydown);
    super.dispose();
  }
};

// src/js/toast.js
var Toast = class extends Component {
  static NAME = "toast";
  static Default = {
    /** Hide automatically after `delay` ms. */
    autohide: true,
    delay: 5e3
  };
  constructor(element, config) {
    super(element, config);
    this._timer = null;
    this._hasFocus = false;
    this._hasHover = false;
    this._element.style.setProperty("--ja-toast-delay", `${this._config.delay}ms`);
    if (!this._element.hasAttribute("role")) this._element.setAttribute("role", "status");
    if (!this._element.hasAttribute("aria-live")) {
      this._element.setAttribute("aria-live", "polite");
    }
    this._bindPause();
  }
  get isShown() {
    return this._element.classList.contains("show");
  }
  show() {
    if (this.isShown) return;
    if (!this._emit("show", {}, true)) return;
    const element = this._element;
    element.classList.remove("hide");
    element.classList.add("show");
    reflow(element);
    this._restartTimer();
    this._emit("shown");
  }
  hide() {
    if (!this.isShown) return;
    if (!this._emit("hide", {}, true)) return;
    this._clearTimer();
    const element = this._element;
    element.classList.remove("show");
    onTransitionEnd(element, () => {
      element.classList.add("hide");
      this._emit("hidden");
    });
  }
  _bindPause() {
    const pause = () => this._clearTimer();
    const resume = () => {
      if (!this._hasHover && !this._hasFocus) this._restartTimer();
    };
    this._element.addEventListener("mouseenter", () => {
      this._hasHover = true;
      pause();
    });
    this._element.addEventListener("mouseleave", () => {
      this._hasHover = false;
      resume();
    });
    this._element.addEventListener("focusin", () => {
      this._hasFocus = true;
      pause();
    });
    this._element.addEventListener("focusout", () => {
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
};

// src/js/theme.js
var THEME_KEY = "ja-ui:theme";
var STYLE_KEY = "ja-ui:style";
var THEMES = ["light", "dark", "system"];
var STYLES = ["default", "brutal"];
var read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
var write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
  }
};
function getTheme() {
  return document.documentElement.dataset.jaTheme ?? read(THEME_KEY) ?? "system";
}
function getResolvedTheme() {
  const theme = getTheme();
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function setTheme(theme) {
  if (!THEMES.includes(theme)) throw new RangeError(`[ja-ui] unknown theme: ${theme}`);
  if (theme === "system") delete document.documentElement.dataset.jaTheme;
  else document.documentElement.dataset.jaTheme = theme;
  write(THEME_KEY, theme);
  document.dispatchEvent(
    new CustomEvent("ja:theme:changed", { detail: { theme, resolved: getResolvedTheme() } })
  );
  return theme;
}
function toggleTheme() {
  return setTheme(getResolvedTheme() === "dark" ? "light" : "dark");
}
function getStyle() {
  return document.documentElement.dataset.jaStyle ?? read(STYLE_KEY) ?? "default";
}
function setStyle(style) {
  if (!STYLES.includes(style)) throw new RangeError(`[ja-ui] unknown style: ${style}`);
  if (style === "default") delete document.documentElement.dataset.jaStyle;
  else document.documentElement.dataset.jaStyle = style;
  write(STYLE_KEY, style);
  document.dispatchEvent(new CustomEvent("ja:style:changed", { detail: { style } }));
  return style;
}
function restoreTheme() {
  const theme = read(THEME_KEY);
  if (theme && theme !== "system") document.documentElement.dataset.jaTheme = theme;
  const style = read(STYLE_KEY);
  if (style && style !== "default") document.documentElement.dataset.jaStyle = style;
}

// src/js/autoinit.js
var TOGGLES = {
  collapse: (target, trigger) => Collapse.getOrCreateInstance(target, {
    parent: trigger.dataset.jaParent ?? null
  }).toggle(),
  "command-palette": (target, trigger) => CommandPalette.getOrCreateInstance(target).toggle(trigger),
  dropdown: (_target, trigger) => Dropdown.getOrCreateInstance(trigger).toggle(),
  modal: (target, trigger) => Modal.getOrCreateInstance(target).toggle(trigger),
  offcanvas: (target, trigger) => Offcanvas.getOrCreateInstance(target).toggle(trigger),
  tab: (_target, trigger) => Tab.getOrCreateInstance(trigger).show(),
  toast: (target) => Toast.getOrCreateInstance(target).show(),
  button: (_target, trigger) => Button.getOrCreateInstance(trigger).toggle()
};
var DISMISSALS = {
  alert: (element) => Alert.getOrCreateInstance(element).close(),
  "command-palette": (element) => CommandPalette.getOrCreateInstance(element).hide(),
  modal: (element) => Modal.getOrCreateInstance(element).hide(),
  offcanvas: (element) => Offcanvas.getOrCreateInstance(element).hide(),
  toast: (element) => Toast.getOrCreateInstance(element).hide()
};
var SELECTORS = {
  alert: ".alert",
  "command-palette": ".command-palette",
  modal: ".modal",
  offcanvas: ".offcanvas",
  toast: ".toast"
};
var wired = false;
function autoInit() {
  if (wired) return;
  wired = true;
  restoreTheme();
  initDropdownDismiss();
  for (const element of document.querySelectorAll(".command-palette[data-ja-hotkey]")) {
    CommandPalette.getOrCreateInstance(element);
  }
  for (const element of document.querySelectorAll("[data-ja-datatable]")) {
    DataTable.getOrCreateInstance(element);
  }
  document.addEventListener("click", (event) => {
    const dismisser = event.target.closest?.("[data-ja-dismiss]");
    if (dismisser) {
      const name2 = dismisser.dataset.jaDismiss;
      const handler2 = DISMISSALS[name2];
      if (handler2) {
        const target2 = dismisser.dataset.jaTarget && document.querySelector(dismisser.dataset.jaTarget) || dismisser.closest(SELECTORS[name2]);
        if (target2) {
          event.preventDefault();
          handler2(target2);
          return;
        }
      }
    }
    const trigger = event.target.closest?.("[data-ja-toggle]");
    if (!trigger) return;
    const name = trigger.dataset.jaToggle;
    const handler = TOGGLES[name];
    if (!handler) return;
    const target = getTargetElement(trigger);
    if (!target && !["dropdown", "button", "tab"].includes(name)) return;
    if (trigger.tagName === "A" || trigger.dataset.jaPreventDefault !== void 0) {
      event.preventDefault();
    }
    handler(target, trigger);
  });
}
function resetAutoInit() {
  wired = false;
}

// src/index.js
function boot() {
  if (typeof document === "undefined") return;
  if (document.body?.hasAttribute("data-ja-no-autoinit")) return;
  autoInit();
}
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
}
var version = "0.1.0";
export {
  Alert,
  Button,
  Collapse,
  CommandPalette,
  Component,
  DataTable,
  Dropdown,
  Modal,
  Offcanvas,
  Tab,
  Toast,
  autoInit,
  fuzzyFilter,
  fuzzyMatch,
  getResolvedTheme,
  getStyle,
  getTheme,
  parseQuery,
  resetAutoInit,
  restoreTheme,
  setStyle,
  setTheme,
  toggleTheme,
  version
};
