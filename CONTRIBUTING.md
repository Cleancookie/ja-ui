# Working on ja-ui

ja-ui styles **plain semantic HTML**. A `<button>` is a button, a `<dialog>` is the modal,
`<details>` is the accordion. Read [ARCHITECTURE.md](ARCHITECTURE.md) first — it is the
contract, and everything below assumes it.

## Ground rules

1. **The platform first.** Before writing a component, find the element that already does
   it. A new CSS file styling a native element is the normal outcome; a new JS module is
   an admission that the platform has no answer, and needs justifying in the PR.
2. **No runtime dependencies.** Dev dependencies are fine; anything that reaches `dist/`
   is not.
3. **No element ships a margin.** Components own their padding and internal `gap`.
   Spacing between things belongs to the parent. There is no utility layer to fall back
   on — pages write their own layout CSS.
4. **Every visual value is a token.** A colour, radius, shadow or duration literal inside
   an element file belongs in `src/styles/tokens.css` instead.
5. **Variants are token remaps, never property declarations.** `.danger` sets
   `--ja-accent`; it does not set `background`. That is what makes one class work
   identically on a button, a callout and a badge.
6. **No `!important`, ever.** It inverts cascade-layer order, which would make this
   library start beating the consumer's own stylesheet. If a rule is losing, it is in the
   wrong layer.
7. **Modern CSS only.** Logical properties, `:has()`, `color-mix()`, `light-dark()`,
   cascade layers, container queries. No floats, no clearfix, no vendor-prefix soup, no
   physical `left`/`right`/`width`.
8. **Accessibility is not a follow-up.** Focus is always visible, targets are at least
   44px, and motion respects `prefers-reduced-motion`. Select on ARIA *state*
   (`[aria-expanded]`, `[aria-current]`); never on ARIA *naming* (`[aria-label="Close"]`
   is translated, and the style vanishes in French), and never use ARIA as a styling hook
   for appearance.

## Layout

```
src/styles/index.css          the layer order, then the imports
src/styles/tokens.css         every visual value, both skins, all three theme states
src/styles/reset.css          :where()-flattened normalize
src/styles/elements/          one file per family of native elements
src/styles/variants.css       the intent classes
src/styles/components/        command palette, data table — the only two non-native ones
src/js/                       only what the platform genuinely cannot do
tools/                        screenshots, GIFs, the smoke test, the site build
site/                         the landing page for the published playground
```

Nothing is generated any more. The old `src/styles/generated/` tree and its scripts are
gone along with the utility classes and the 12-column grid — edit the CSS directly.

## Adding a component

1. **Find the native element.** Check ARCHITECTURE.md's mapping table. If HTML has an
   element for it, style that element, and the answer is usually a few rules in an
   existing file rather than a new one.
2. Structure and custom properties in `src/styles/elements/<family>.css`, then the
   `@import` in `src/styles/index.css`. Wrap every rule in `@layer ja.elements`.
3. Colour variants come free if you read `var(--ja-accent, <your default>)`. If they do
   not, you are writing properties where you should be reading tokens.
4. If it genuinely needs behaviour: a module in `src/js/`, exported from `src/index.js`,
   called from `src/js/autoinit.js`, and typed in `src/index.d.ts`. Feature-detect and
   fall back — an unsupported `command` button is *dead*, and that is worse than not
   shipping it.
5. A story in `stories/`, and an assertion in `tools/smoke.mjs` if it has JS.
6. `npm run build && npm run smoke`.

## Theming

Three states, never a boolean: **system** (no attribute), `light`, `dark`. The attribute's
primary home is `<html>`, because `color-scheme` does not propagate from `<body>` to the
viewport and you would get a light scrollbar on a dark page. Because the selectors are
bare, it *also* works on `<body>` and on any subtree — `<aside data-theme="dark">` inside
a light page is supported on purpose.

Tokens are declared twice: a plain light value, then the real `light-dark()` declaration.
`light-dark()` is not a graceful no-op — an unsupported colour function invalidates the
whole declaration and the element gets no colour at all — so the plain declaration
underneath is the fallback. **Never declare a colour only once.**

## The playground

The published site is built from source and deployed by `.github/workflows/pages.yml` on
every push to `main` (Settings → Pages → source: GitHub Actions). Merging is deploying;
the Actions tab is the deploy log.

`npm run site` assembles it from `site/`, `examples/`, `dist/` and the built Storybook
into `docs/`, and `npm run site:serve` previews that on :6008. `docs/` is gitignored build
output — preview with it, never commit it, never hand-edit it.

`site/images/` is source, not build output — `npm run shots` writes it, and the site build
copies it to `docs/images/`.

Keep it base-path agnostic: the site is served from `/<repo>/`, so no absolute URLs
(`/examples/…`) anywhere in the landing page, the example pages or the stories.

## Commit messages

Every commit message starts with an emoji. It is not decoration — it records the semver
bump the change carries, so a commit without one cannot be versioned.

| Emoji | Meaning | Bump |
| --- | --- | --- |
| 🔥 | Breaking change — removed or renamed a class, attribute, event, export or token | **major** |
| ✨ | New feature — a new component, variant, utility or public API | **minor** |
| 🛠️ | Change — refactor, retune, perf, build/tooling, dependency work | **minor** |
| 🐛 | Bug fix | **patch** |
| 📝 | Docs — README, CONTRIBUTING, stories, the playground site, comments | **patch** |

The emoji is the first character, then a space, then an imperative subject in lower case
with no trailing full stop. One emoji per commit — if a change is both a feature and a
fix, split it or take the higher bump. A release bumps by the highest bump among the
commits since the last release, so a single 🔥 makes the whole release major, and a 🔥
commit also needs a `BREAKING CHANGE:` paragraph in the body describing the migration.

```
✨ add a toast component
🐛 stop the command palette double-binding on re-init
🛠️ retune the press physics
📝 document the dark theme override
🔥 drop the utility classes and the grid
```

## Releasing

There is no release yet: ja-ui is not tagged and not published to any registry, and
nothing else consumes it. The commit emoji still matter — they are what a first release
would be versioned from, the highest bump among the commits since it wins.

Publishing the site is a separate thing and happens by itself: merge to `main` and the
Pages workflow deploys. `CLAUDE.md` has the full checklist.
