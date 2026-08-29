# Working on ja-ui

## Ground rules

1. **No runtime dependencies.** Dev dependencies are fine; anything that ends up in
   `dist/` is not.
2. **No component ships a margin.** Spacing between things belongs to the parent.
   Components own their padding and internal `gap`, nothing more.
3. **Every visual value is a token.** If you write a colour, radius, shadow or duration
   literal inside a component, it belongs in `src/styles/base/tokens.css` instead.
   The dark theme is declared twice — once for `[data-ja-theme="dark"]`, once for
   `prefers-color-scheme` — and `npm run lint:css` fails if the two drift apart.
4. **Bootstrap's class names, ja-ui's data attributes.** Classes mirror Bootstrap 5 so
   markup ports across. JavaScript hooks are `data-ja-*` and events are `ja:*`, so the
   two libraries never fight over behaviour.
5. **Modern CSS only.** Flexbox and grid, logical properties, `color-mix()`, `:has()`,
   cascade layers. No floats, no clearfix, no vendor-prefix soup.
6. **Accessibility is not a follow-up.** Focus is always visible, dialogs trap focus,
   targets are at least 44px, and motion respects `prefers-reduced-motion`.

## Layout

```
src/styles/base/         tokens, reset, typography
src/styles/layout/       stacks, ratios, sticky helpers
src/styles/components/   one file per component — structure only, no colour loops
src/styles/generated/    grid, colour variants, utilities — DO NOT EDIT
src/js/                  one module per interactive component
tools/                   CSS generators, screenshots, GIFs, smoke test, site build
site/                    the landing page for the published playground
```

Anything repetitive across colours or breakpoints is generated. Edit the generator in
`tools/`, run `npm run gen`, and commit the result — CI fails if `src/styles/generated`
is out of date.

## Adding a component

1. Structure and custom properties in `src/styles/components/<name>.css`, then add the
   `@import` to `src/styles/index.css`.
2. Per-colour variants go in `tools/gen-variants.mjs`, never inline.
3. If it needs behaviour: a module in `src/js/`, extending `Component`, exported from
   `src/index.js`, registered in `src/js/autoinit.js`, and typed in `src/index.d.ts`.
4. A story in `stories/`, and an assertion in `tools/smoke.mjs` if it has JS.
5. `npm run build && npm run smoke`.

## The playground

The published site is the committed `docs/` folder: GitHub Pages serves it directly off
`main` (Settings → Pages → deploy from a branch, `main` `/docs`). There is no deploy
workflow — pushing is deploying.

`npm run site` rebuilds it from `site/`, `examples/`, `dist/` and the built Storybook, and
`npm run site:serve` previews it on :6008. **Anything that changes the CSS, the JS, the
examples or the landing page needs `npm run site` and a commit of `docs/`**, or the site
goes stale against the source.

`docs/images/` is source, not build output — `npm run shots` writes it and the site build
leaves it in place.

Keep it base-path agnostic: the site is served from `/<repo>/`, so no absolute URLs
(`/examples/…`) anywhere in the landing page, the example pages or the stories.

## Commit messages

Every commit message starts with an emoji. It is not decoration — the release tooling
reads it to work out the semver bump, so a commit without one cannot be versioned.

| Emoji | Meaning | Bump |
| --- | --- | --- |
| 🔥 | Breaking change — removed or renamed a class, attribute, event, export or token | **major** |
| ✨ | New feature — a new component, variant, utility or public API | **minor** |
| 🛠️ | Change — refactor, retune, perf, build/tooling, dependency work | **minor** |
| 🐛 | Bug fix | **patch** |
| 📝 | Docs — README, CONTRIBUTING, stories, the playground site, comments | **patch** |

The emoji is the first character, then a space, then an imperative subject in lower
case with no trailing full stop. One emoji per commit — if a change is both a feature
and a fix, split it or take the higher bump. A release bumps by the highest bump among
the commits since the last tag, so a single 🔥 makes the whole release major, and a 🔥
commit also needs a `BREAKING CHANGE:` paragraph in the body describing the migration.

```
✨ add a toast component
🐛 stop the command palette double-binding on re-init
🛠️ regenerate colour variants from the token set
📝 document the dark theme override
🔥 rename data-ja-modal to data-ja-dialog
```

## Releasing

The bump is the highest among the commit emoji since the last release — 🔥 major, ✨ or
🛠️ minor, 🐛 or 📝 patch. `npm version <major|minor|patch>` writes `package.json` and
tags in one step; push with `git push --follow-tags`, then publish a GitHub release on
that tag. The `publish` workflow builds and pushes the package to the GitHub npm
registry — no release, no publish.

Anything user-visible also needs `npm run site` and a commit of `docs/` in the same
push, or the published playground goes stale. `CLAUDE.md` has the full checklist.
