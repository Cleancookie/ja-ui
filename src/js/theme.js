/**
 * Theme — light/dark and the visual skin, persisted per browser.
 * Both are plain attributes on <html>, so you can also set them server-side:
 *   <html data-theme="dark" data-style="brutal">
 */

const THEME_KEY = 'ja-ui:theme';
const STYLE_KEY = 'ja-ui:style';
const THEMES = ['light', 'dark', 'system'];
const STYLES = ['default', 'brutal'];

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // private mode, blocked storage — themes just don't persist
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
};

/** 'light' | 'dark' | 'system' */
export function getTheme() {
  return document.documentElement.dataset.theme ?? read(THEME_KEY) ?? 'system';
}

/** What the user actually sees right now. */
export function getResolvedTheme() {
  const theme = getTheme();
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setTheme(theme) {
  if (!THEMES.includes(theme)) throw new RangeError(`[ja-ui] unknown theme: ${theme}`);
  if (theme === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  write(THEME_KEY, theme);
  document.dispatchEvent(
    new CustomEvent('ja:theme:changed', { detail: { theme, resolved: getResolvedTheme() } })
  );
  return theme;
}

export function toggleTheme() {
  return setTheme(getResolvedTheme() === 'dark' ? 'light' : 'dark');
}

/** 'default' | 'brutal' */
export function getStyle() {
  return document.documentElement.dataset.style ?? read(STYLE_KEY) ?? 'default';
}

export function setStyle(style) {
  if (!STYLES.includes(style)) throw new RangeError(`[ja-ui] unknown style: ${style}`);
  if (style === 'default') delete document.documentElement.dataset.style;
  else document.documentElement.dataset.style = style;
  write(STYLE_KEY, style);
  document.dispatchEvent(new CustomEvent('ja:style:changed', { detail: { style } }));
  return style;
}

/** Re-apply whatever was stored. Called for you by ja-ui's auto-init. */
export function restoreTheme() {
  const theme = read(THEME_KEY);
  if (theme && theme !== 'system') document.documentElement.dataset.theme = theme;
  const style = read(STYLE_KEY);
  if (style && style !== 'default') document.documentElement.dataset.style = style;
}
