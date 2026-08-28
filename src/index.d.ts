/**
 * ja-ui — Just Another UI
 * Type definitions for the zero-dependency component library.
 */

export interface ComponentConfig {
  [key: string]: unknown;
}

export declare class Component<C extends ComponentConfig = ComponentConfig> {
  static readonly NAME: string;
  static readonly Default: ComponentConfig;
  constructor(element: Element | string, config?: C);
  readonly element: HTMLElement;
  readonly config: C;
  dispose(): void;
  static getInstance<T extends Component>(
    this: new (...args: never[]) => T,
    element: Element | string
  ): T | null;
  static getOrCreateInstance<T extends Component>(
    this: new (...args: never[]) => T,
    element: Element | string,
    config?: ComponentConfig
  ): T;
}

export interface CollapseConfig extends ComponentConfig {
  /** Selector for a parent accordion; siblings close when this one opens. */
  parent?: string | Element | null;
  /** Toggle immediately on construction. */
  toggle?: boolean;
}

export declare class Collapse extends Component<CollapseConfig> {
  readonly isShown: boolean;
  show(): void;
  hide(): void;
  toggle(): void;
}

export interface CommandPaletteItem {
  /** Shown as the row's title, and the text the fuzzy matcher ranks on. */
  label: string;
  /** Muted text beside the label. Also searchable, at a lower weight. */
  description?: string;
  /** Right-hand text — a keyboard shortcut, a type, a path. */
  hint?: string;
  /** Alias for `hint`. */
  shortcut?: string;
  /** Group header shown when the query is empty; searchable either way. */
  group?: string;
  /** Trusted HTML (an inline `<svg>`) rendered in the row's leading slot. */
  icon?: string;
  /** Extra search terms that are never displayed. */
  keywords?: string | string[];
  disabled?: boolean;
  onSelect?(item: CommandPaletteItem, event: Event | null): void;
  [key: string]: unknown;
}

export interface CommandPaletteConfig extends ComponentConfig {
  /** Items, a function returning them (called on every open), or a selector
   *  for a `<script type="application/json">` holding them. */
  items?: Array<CommandPaletteItem | string> | (() => Array<CommandPaletteItem | string>) | string | null;
  placeholder?: string;
  emptyText?: string;
  /** Global shortcut that opens it, e.g. `'mod+k'` — `mod` is ⌘ on macOS. */
  hotkey?: string | null;
  /** Dim the page behind, and close on an outside click. Default: true. */
  backdrop?: boolean;
  /** Close on Escape. Default: true. */
  keyboard?: boolean;
  /** Reset the query when it closes. Default: true. */
  clearOnClose?: boolean;
  /** Show group headers while the query is empty. Default: true. */
  groups?: boolean;
  /** Rows rendered either side of the visible window. Default: 4. */
  overscan?: number;
  /** Cap the number of results. Default: 0 (no cap). */
  limit?: number;
  /** Stay open after a selection. Default: false. */
  keepOpen?: boolean;
  onSelect?(item: CommandPaletteItem, event: Event | null): void;
}

export declare class CommandPalette extends Component<CommandPaletteConfig> {
  readonly isShown: boolean;
  readonly items: CommandPaletteItem[];
  readonly activeItem: CommandPaletteItem | null;
  show(relatedTarget?: Element | null): void;
  hide(): void;
  toggle(relatedTarget?: Element | null): void;
  /** Replace the list. Lowercase haystacks are built once, here. */
  setItems(items: Array<CommandPaletteItem | string>): this;
  /** Run the highlighted row. Returns false if there was nothing to run. */
  select(event?: Event | null): boolean;
}

export interface FuzzyMatch {
  score: number;
  /** Indices into the label, for highlighting. */
  positions: number[];
}

/** Split a raw query into the lowercase terms `fuzzyMatch` expects. */
export declare function parseQuery(query: string): string[];

export declare function fuzzyMatch(
  text: string,
  terms: string[],
  options?: { lowerText?: string; primaryLength?: number }
): FuzzyMatch | null;

export declare function fuzzyFilter(
  texts: string[],
  query: string
): Array<{ index: number } & FuzzyMatch>;

export interface DropdownConfig extends ComponentConfig {
  /** Close when a menu item is clicked. Default: true. */
  autoClose?: boolean;
}

export declare class Dropdown extends Component<DropdownConfig> {
  readonly isShown: boolean;
  show(): void;
  hide(): void;
  toggle(): void;
  static closeAll(exceptTarget?: Element | null): void;
}

export interface ModalConfig extends ComponentConfig {
  /** true | false | 'static' — 'static' nudges instead of closing. */
  backdrop?: boolean | 'static';
  /** Close on Escape. Default: true. */
  keyboard?: boolean;
  /** Trap and move focus into the dialog. Default: true. */
  focus?: boolean;
}

export declare class Modal extends Component<ModalConfig> {
  readonly isShown: boolean;
  show(relatedTarget?: Element | null): void;
  hide(): void;
  toggle(relatedTarget?: Element | null): void;
}

export interface OffcanvasConfig extends ComponentConfig {
  backdrop?: boolean;
  keyboard?: boolean;
  /** Keep the page scrollable while open. Default: false. */
  scroll?: boolean;
}

export declare class Offcanvas extends Component<OffcanvasConfig> {
  readonly isShown: boolean;
  show(relatedTarget?: Element | null): void;
  hide(): void;
  toggle(relatedTarget?: Element | null): void;
}

export declare class Tab extends Component {
  show(): void;
}

export interface ToastConfig extends ComponentConfig {
  /** Hide automatically after `delay` ms. Default: true. */
  autohide?: boolean;
  /** Milliseconds before auto-hiding. Default: 5000. */
  delay?: number;
}

export declare class Toast extends Component<ToastConfig> {
  readonly isShown: boolean;
  show(): void;
  hide(): void;
}

export declare class Alert extends Component {
  close(): void;
}

export declare class Button extends Component {
  toggle(): boolean;
}

export type Theme = 'light' | 'dark' | 'system';
export type Style = 'default' | 'brutal';

export declare function getTheme(): Theme;
export declare function getResolvedTheme(): 'light' | 'dark';
export declare function setTheme(theme: Theme): Theme;
export declare function toggleTheme(): Theme;
export declare function getStyle(): Style;
export declare function setStyle(style: Style): Style;
export declare function restoreTheme(): void;

export declare function autoInit(): void;
export declare function resetAutoInit(): void;

export declare const version: string;

/** Namespaced events dispatched on the component's element. */
export interface JaUIEventMap {
  'ja:collapse:show': CustomEvent;
  'ja:collapse:shown': CustomEvent;
  'ja:collapse:hide': CustomEvent;
  'ja:collapse:hidden': CustomEvent;
  'ja:command-palette:show': CustomEvent<{ relatedTarget: Element | null }>;
  'ja:command-palette:shown': CustomEvent<{ relatedTarget: Element | null }>;
  'ja:command-palette:hide': CustomEvent;
  'ja:command-palette:hidden': CustomEvent;
  'ja:command-palette:filter': CustomEvent<{ query: string; count: number }>;
  'ja:command-palette:highlight': CustomEvent<{ item: CommandPaletteItem | null; index: number }>;
  'ja:command-palette:select': CustomEvent<{ item: CommandPaletteItem; index: number; query: string }>;
  'ja:dropdown:show': CustomEvent;
  'ja:dropdown:shown': CustomEvent;
  'ja:dropdown:hide': CustomEvent;
  'ja:dropdown:hidden': CustomEvent;
  'ja:modal:show': CustomEvent<{ relatedTarget: Element | null }>;
  'ja:modal:shown': CustomEvent<{ relatedTarget: Element | null }>;
  'ja:modal:hide': CustomEvent;
  'ja:modal:hidden': CustomEvent;
  'ja:offcanvas:show': CustomEvent;
  'ja:offcanvas:shown': CustomEvent;
  'ja:offcanvas:hide': CustomEvent;
  'ja:offcanvas:hidden': CustomEvent;
  'ja:tab:show': CustomEvent<{ relatedTarget: Element | null }>;
  'ja:tab:shown': CustomEvent<{ relatedTarget: Element | null }>;
  'ja:toast:show': CustomEvent;
  'ja:toast:shown': CustomEvent;
  'ja:toast:hide': CustomEvent;
  'ja:toast:hidden': CustomEvent;
  'ja:alert:close': CustomEvent;
  'ja:alert:closed': CustomEvent;
  'ja:button:toggled': CustomEvent<{ pressed: boolean }>;
}
