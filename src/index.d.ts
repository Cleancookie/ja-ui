/**
 * ja-ui — Just Another UI
 *
 * The stylesheet is the library. These are the few things the web platform
 * does not do for you.
 */

export type Theme = 'light' | 'dark' | 'system';
export type Style = 'default' | 'brutal';

/** Shared plumbing for the two components that are not native elements. */
export class Component {
  static NAME: string;
  static Default: Record<string, unknown>;
  constructor(element: Element | string, config?: Record<string, unknown>);
  readonly element: Element;
  readonly config: Record<string, unknown>;
  dispose(): void;
  static getInstance<T extends Component>(
    this: new (...args: never[]) => T,
    element: Element | string
  ): T | null;
  static getOrCreateInstance<T extends Component>(
    this: new (...args: never[]) => T,
    element: Element | string,
    config?: Record<string, unknown>
  ): T;
}

/* -------------------------------------------------------------------------- */
/* Command palette                                                            */
/* -------------------------------------------------------------------------- */

export interface CommandPaletteItem {
  id?: string;
  /** `title` and `name` are accepted as aliases. */
  label: string;
  /** Secondary line under the label. */
  description?: string;
  /** Right-aligned hint, e.g. a shortcut. `shortcut` is an alias. */
  hint?: string;
  shortcut?: string;
  /** Group heading this item sits under. */
  group?: string;
  /** Extra text the fuzzy matcher searches but never shows. */
  keywords?: string;
  icon?: string;
  disabled?: boolean;
  /** Called when this row is chosen. */
  onSelect?: (item: CommandPaletteItem, event: Event | null) => void;
  [key: string]: unknown;
}

export interface CommandPaletteOptions {
  /** Items, or a function returning them — called on every open. */
  items?: CommandPaletteItem[] | (() => CommandPaletteItem[]) | null;
  placeholder?: string;
  emptyText?: string;
  /** Global shortcut that opens it, e.g. "mod+k". Null wires up nothing. */
  hotkey?: string | null;
  /** Dim the page behind, and close on an outside click. */
  backdrop?: boolean;
  /** Close on Escape. */
  keyboard?: boolean;
  /** Reset the query when it closes. */
  clearOnClose?: boolean;
  /** Show group headings when the query is empty. */
  groups?: boolean;
  /** Rows rendered above and below the visible window. */
  overscan?: number;
  /** Cap the number of results; 0 for no cap. */
  limit?: number;
  /** Keep it open after a selection. */
  keepOpen?: boolean;
  onSelect?: (item: CommandPaletteItem, event: Event | null) => void;
}

export class CommandPalette extends Component {
  constructor(element: Element | string, config?: CommandPaletteOptions);
  show(relatedTarget?: Element | null): void;
  hide(): void;
  toggle(relatedTarget?: Element | null): void;
  select(event?: Event | null): void;
  setItems(items: CommandPaletteItem[]): void;
  readonly items: CommandPaletteItem[];
  readonly activeItem: CommandPaletteItem | null;
  readonly isShown: boolean;
}

/* -------------------------------------------------------------------------- */
/* Data table                                                                 */
/* -------------------------------------------------------------------------- */

export interface DataTableColumn {
  key?: string;
  label?: string;
  width?: number;
  align?: 'start' | 'center' | 'end';
}

export interface DataTableOptions {
  /** Explicit columns, or use `columnCount` + `getColumnLabel` for a virtual set. */
  columns?: DataTableColumn[] | null;
  /** Explicit rows, or use `rowCount` + `getCell`/`getRow` for a virtual set. */
  rows?: unknown[][] | null;
  columnCount?: number;
  rowCount?: number;
  /** Fixed by default — that is what keeps a million rows cheap. */
  defaultColumnWidth?: number;
  minColumnWidth?: number;
  /** The cap a double-click auto-size will not exceed, so a JSON blob
   *  cannot explode the column to the width of the document. */
  maxAutoWidth?: number;
  /** How many rows an auto-size measures before deciding. */
  autoSizeSample?: number;
  rowHeight?: number;
  headerHeight?: number;
  gutterWidth?: number;
  overscan?: number;
  selectable?: boolean;
  getColumnLabel?: ((index: number) => string) | null;
  getCell?: ((rowIndex: number, columnIndex: number) => unknown) | null;
  getRow?: ((rowIndex: number) => unknown[]) | null;
}

export class DataTable extends Component {
  constructor(element: Element | string, config?: DataTableOptions);
  /** Auto-size one column to its contents, capped at `maxAutoWidth`. */
  autoSizeColumn(index: number): void;
  /** Auto-size every column, the way double-clicking the corner does. */
  autoSizeAll(): void;
  selectAll(selected?: boolean): void;
  readonly rowCount: number;
  readonly columnCount: number;
  readonly selectedAll: boolean;
}

/* -------------------------------------------------------------------------- */
/* Fuzzy matching — exported because the palette's ranking is useful alone     */
/* -------------------------------------------------------------------------- */

export interface FuzzyMatch {
  score: number;
  /** Indices into the haystack to highlight. Only ever inside the visible label. */
  positions: number[];
}

export interface FuzzyMatchOptions {
  /** Pre-lowercased `text`, when the caller already has one cached. */
  lowerText?: string;
  /** Characters at the start of `text` that are the "real" label. Anything past
   *  it (keywords, description) scores less and is never highlighted. */
  primaryLength?: number;
}

/** Match one haystack against the AND-ed `terms` from `parseQuery`. */
export function fuzzyMatch(
  text: string,
  terms: string[],
  options?: FuzzyMatchOptions
): FuzzyMatch | null;

/** Split a raw query into lowercase AND-ed terms. */
export function parseQuery(query: string): string[];

/** Filter and rank a list of strings, best first. */
export function fuzzyFilter(
  texts: string[],
  query: string
): Array<{ index: number; score: number; positions: number[] }>;

/* -------------------------------------------------------------------------- */
/* Tabs — the W3C APG keyboard model, since HTML has no tabs element           */
/* -------------------------------------------------------------------------- */

/** Bind the delegated tablist listeners. Idempotent; auto-init calls it. */
export function initTabs(): void;

/** Select a `[role="tab"]`, revealing its panel. Returns false if cancelled. */
export function selectTab(tab: Element, options?: { focus?: boolean }): boolean;

/* -------------------------------------------------------------------------- */
/* Toasts                                                                     */
/* -------------------------------------------------------------------------- */

export interface ToastOptions {
  /** A colour class — 'success', 'danger', 'warning', … */
  variant?: string;
  /** Milliseconds before self-dismissal; 0 to persist. */
  duration?: number;
  placement?: 'start' | 'end' | 'top' | 'bottom';
  dismissible?: boolean;
}

export function toast(message: string | Node, options?: ToastOptions): HTMLElement;
export function dismissToast(element: HTMLElement): void;

/* -------------------------------------------------------------------------- */
/* Invoker commands                                                           */
/* -------------------------------------------------------------------------- */

/** Fallback for `command`/`commandfor`. No-op where the platform implements it. */
export function initInvokers(): void;
export const hasNativeInvokers: boolean;

/* -------------------------------------------------------------------------- */
/* Theme                                                                      */
/* -------------------------------------------------------------------------- */

export function getTheme(): Theme;
/** What the user actually sees right now — never 'system'. */
export function getResolvedTheme(): 'light' | 'dark';
export function setTheme(theme: Theme): Theme;
export function toggleTheme(): Theme;
export function getStyle(): Style;
export function setStyle(style: Style): Style;
export function restoreTheme(): void;

/* -------------------------------------------------------------------------- */

export function autoInit(): void;
export function resetAutoInit(): void;
export const version: string;

declare global {
  interface DocumentEventMap {
    'ja:theme:changed': CustomEvent<{ theme: Theme; resolved: 'light' | 'dark' }>;
    'ja:style:changed': CustomEvent<{ style: Style }>;
  }
  interface HTMLElementEventMap {
    'ja:tabs:show': CustomEvent<{ tab: Element; previous?: Element; panel: Element | null }>;
    'ja:tabs:shown': CustomEvent<{ tab: Element; previous?: Element; panel: Element | null }>;
    'ja:toast:shown': CustomEvent<{ element: HTMLElement }>;
    'ja:toast:hide': CustomEvent<{ element: HTMLElement }>;
  }
}
