# ja-ui architecture — the native HTML5 rewrite

ja-ui styles **plain semantic HTML**. Drop one stylesheet in, write ordinary markup, and
the page is themed. There is no `.btn`, no `.card`, no `.modal`. A `<button>` is a button,
a `<dialog>` is the modal, `<details>` is the accordion.

## The contract

1. **Element selectors first.** Style the element. Reach for a class only when the
   platform gives you nothing to select (a callout, a badge) or when the author is
   choosing an intent (`.primary`, `.danger`).
2. **Variants are bare single-word classes**, and they are expressed **only as token
   remaps** — never as raw property declarations. This is what makes one class work on
   `button`, `a`, `summary` and `input[type=submit]` alike, and what stops variants
   escalating specificity.
   ```css
   button { background: var(--ja-btn-bg, var(--ja-surface)); }
   .primary { --ja-btn-bg: var(--ja-primary); }   /* never writes background: */
   ```
3. **Everything visual is a token** in `src/styles/tokens.css`. No colour, radius,
   shadow or duration literal in an element file.
4. **No element ships a margin.** Components own padding and internal `gap`. Spacing
   between things belongs to the parent.
5. **Zero runtime dependencies.** Nothing that reaches `dist/`.
6. **Accessibility is baked in**, because the consumer is explicitly not going to think
   about it. Focus is always visible, targets are >= 44px, motion respects
   `prefers-reduced-motion`.

## Cascade layers

The first bytes of `index.css` declare the order. **This is mandatory, not stylistic:**
unlayered CSS beats layered CSS regardless of specificity, so a consumer's own stylesheet
wins with no `!important` and no specificity archaeology.

```css
@layer ja.reset, ja.tokens, ja.elements, ja.variants, ja.components;
```

| Layer | Holds |
| --- | --- |
| `ja.reset` | `:where()`-flattened normalize. Box sizing, margin zeroing. Nothing opinionated. |
| `ja.tokens` | `--ja-*` only. `:root`, `:host`, `[data-theme]`. Nothing else. |
| `ja.elements` | Bare element selectors, and ARIA **state** selectors. |
| `ja.variants` | The intent classes, as token remaps only. |
| `ja.components` | The two non-native components: command palette, data table. |

**Never ship `!important`** — `!important` inverts layer order, so ours would beat a
consumer's. There is no `!important` anywhere in this library.

## ARIA

Select on ARIA **state**, never on ARIA **naming**:

- ✅ `[aria-expanded="true"]`, `[aria-current="page"]`, `[aria-pressed="true"]`,
  `[aria-selected="true"]`, `[aria-invalid="true"]`, `[aria-busy="true"]`, `[aria-sort]`
- ❌ `[aria-label="Close"]` — that value is translated, so the style vanishes in French.
- ❌ ARIA as a styling hook for appearance. ARIA describes state to assistive tech; using
  it to pick a colour is an anti-pattern and lies to screen readers.

## Theming

`color-scheme` does **not** propagate from `<body>` to the viewport, so the theme
attribute's primary home is `<html>` — otherwise you get a light scrollbar on a dark page,
and the anti-FOUC script has no `<body>` to write to yet.

Because the selectors are bare (`[data-theme="dark"]`, not `:root[data-theme="dark"]`),
the attribute **also works on `<body>` or on any subtree** — an `<aside data-theme="dark">`
inside a light page is a supported, first-class thing. A `:has()` compat rule lifts a
body-level theme up to the viewport so that spelling isn't broken either.

Three states, never a boolean: **system** (no attribute) / `light` / `dark`. A boolean
breaks the user who toggled once and later changed their OS preference.

Tokens are declared once with `light-dark()`, preceded by a plain fallback declaration —
`light-dark()` is not a graceful no-op, an unsupported colour function invalidates the
whole declaration and the element gets no colour at all.

```css
--ja-body-bg: #fffdf5;                        /* fallback: light everywhere */
--ja-body-bg: light-dark(#fffdf5, #282c34);   /* the real declaration */
```

Custom properties substitute at use time, so a token declared on `:root` resolves its
`light-dark()` against the *using* element's `color-scheme`. That is what makes subtree
theming work from a single token block.

`data-style="brutal"` selects the second skin. It overrides tokens only.

## Feature gating

| Ship unguarded | Guard with a fallback | Don't ship |
| --- | --- | --- |
| `<dialog>`, `::backdrop`, `:has()`, `@layer`, `color-mix()`, `oklch()`, `:user-invalid`, `<search>`, `@container` | `light-dark()` (plain declaration first), `details[name]`, `@starting-style` + `allow-discrete`, `field-sizing`, `closedby`, `appearance: base-select`, popover API, anchor positioning (`@supports`), `command`/`commandfor` (**keep a JS click listener — an unsupported command button is dead**) | `interestfor`, `if()`, `@function`, `interpolate-size`, scroll-driven animations |

Use `:user-invalid`, **never** `:invalid` — the latter matches an empty required field on
page load and paints the form red before anyone has typed.

## Layout

The 12-column grid and the utility classes are **gone**. Pages lay themselves out with
their own CSS. The library styles content, not layout.

## Where things live

```
src/styles/index.css          layer order + imports
src/styles/tokens.css         every visual value, both skins, all three theme states
src/styles/reset.css          :where()-flattened normalize
src/styles/elements/*.css     one file per family of native elements
src/styles/variants.css       the intent classes, token remaps only
src/styles/components/*.css   command palette, data table — the two non-native ones
src/js/*.js                   only what the platform genuinely cannot do
```

## The variant contract

This is the part every element file has to agree on. Variants are **two axes**, and they
compose: `class="danger outline"`, `class="primary lg"`.

**Axis 1 — colour.** Ten classes, and each one sets **exactly two tokens**, nothing else:

```css
@layer ja.variants {
  .primary { --ja-accent: var(--ja-primary); --ja-accent-fg: var(--ja-primary-fg); }
  .danger  { --ja-accent: var(--ja-danger);  --ja-accent-fg: var(--ja-danger-fg); }
  /* .secondary .success .info .warning .light .dark .pop .fresh — same shape */
  .plain   { --ja-accent: initial; --ja-accent-fg: initial; }  /* opt back out */
}
```

`initial` on a custom property is the guaranteed-invalid value, which is what makes
`.plain` fall through to the element's own default.

**Axis 2 — treatment**, for controls: `.outline`, `.soft`, `.ghost`. Sizes: `.sm`, `.lg`.

**Every tintable element reads the accent with its own default as the fallback:**

```css
button {
  background: var(--ja-accent, var(--ja-surface));
  color: var(--ja-accent-fg, var(--ja-text));
}
```

That single indirection is why one `.danger` works identically on `button`, `a.button`,
`input[type=submit]`, a callout and a badge, and why no variant ever writes a raw
property or escalates specificity.

### Inference goes in `ja.elements`, explicit classes go in `ja.variants`

Some intent is already in the markup and needs no class at all:

```css
@layer ja.elements {
  /* the submit button of a form IS the primary action */
  button[type="submit"], input[type="submit"] { --ja-accent: var(--ja-primary); … }
  /* the default action of a dialog */
  dialog button[autofocus] { --ja-accent: var(--ja-primary); … }
  /* the way out of a dialog is quiet */
  button:is([command="close"], [command="request-close"], [formnovalidate]) { … }
}
```

Putting inference one layer **below** the explicit classes is what makes
`<button type="submit" class="danger">` come out red. Layer order sorts above
specificity, so `.danger` (0-1-0) beats `button[type="submit"]` (0-1-1) purely by living
in the later layer. Do not try to win this with `:not()` chains.

There is no native signal for "destructive" — `[type=reset]` is a UX anti-pattern and is
not used for it. `.danger` is the only spelling.

## The complete class inventory

This is all of it. Everything else is an element, an attribute, or an ARIA state.

| Axis | Classes |
| --- | --- |
| **Colour** (sets `--ja-accent` + `--ja-accent-fg`) | `.primary` `.secondary` `.success` `.info` `.warning` `.danger` `.light` `.dark` `.pop` `.fresh` `.plain` |
| **Treatment** | `.outline` `.soft` `.ghost` |
| **Size** | `.sm` `.lg` |
| **Controls** | `a.button` (a link that should look like a button), `.icon` (icon-only) |
| **Content** | `article` *is* the card; `article.interactive` lifts on hover |
| **Dialog** | `dialog.drawer` + one of `.start` `.end` `.top` `.bottom` |
| **Navigation** | `nav.sticky`, `.breadcrumb`, `.pagination`, `ul.list`, `a.skip` |
| **Feedback** | `.callout` `.badge` `.toasts` `.toast` `.spinner` `.skeleton` |
| **Table** | `.striped` `.compact` `.bordered` `.numeric` |
| **Typography** | `.lead` `.measure` |
| **Accessibility** | `.visually-hidden` |
| **The two non-native components** | `.command-palette`, `[data-ja-datatable]` |

Attributes the library reads: `data-theme` (`light`/`dark`, on `<html>` or any subtree),
`data-style="brutal"`, `data-ja-theme-toggle` (a button that flips the theme),
`data-ja-no-autoinit` (on `<body>`), `data-ja-hotkey` (command palette),
`data-ja-activation="manual"` (tablist).

### What replaced what

| Bootstrap | ja-ui now |
| --- | --- |
| `.btn .btn-primary` | `<button class="primary">` |
| `.btn .btn-outline-danger` | `<button class="danger outline">` |
| `.card` / `.card-body` | `<article>` |
| `.modal` + JS | `<dialog>` + `showModal()` |
| `.offcanvas` | `<dialog class="drawer end">` |
| `.accordion` / `.collapse` | `<details>` / `<summary>` |
| `.dropdown` / `.dropdown-menu` | `[popover]` + `popovertarget` |
| `.nav-tabs` | `[role="tablist"]` + the APG keyboard model |
| `.alert` | `.callout` |
| `.progress` / `.progress-bar` | `<progress>` |
| `.form-control` / `.form-label` | `<input>` / `<label>` |
| `.form-select` | `<select>` |
| `.breadcrumb` / `.pagination` | `<nav><ol>` + `aria-current="page"` |
| `.list-group` | `<ul role="list" class="list">` |
| `.table` | `<table>` |
| `.row` / `.col-6` / `.d-flex` / `.gap-3` / `.p-4` | **gone** — write page CSS |
