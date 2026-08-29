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

The published site is built from source and deployed by `.github/workflows/pages.yml` on
every push to `main` (Settings → Pages → source: GitHub Actions). Merging is deploying;
the Actions tab is the deploy log.

`npm run site` assembles it from `site/`, `examples/`, `dist/` and the built Storybook
into `docs/`, and `npm run site:serve` previews that on :6008. `docs/` is gitignored
build output — preview with it, never commit it, never hand-edit it.

`site/images/` is source, not build output — `npm run shots` writes it, and the site
build copies it to `docs/images/`.

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

The emoji is the first character, then a space, then an imperative subject in lower
case with no trailing full stop. One emoji per commit — if a change is both a feature
and a fix, split it or take the higher bump. A release bumps by the highest bump among
the commits since the last release, so a single 🔥 makes the whole release major, and a 🔥
commit also needs a `BREAKING CHANGE:` paragraph in the body describing the migration.

```
✨ add a toast component
🐛 stop the command palette double-binding on re-init
🛠️ regenerate colour variants from the token set
📝 document the dark theme override
🔥 rename data-ja-modal to data-ja-dialog
```

## Releasing

There is no release yet: ja-ui is not tagged and not published to any registry, and
nothing else consumes it. The commit emoji still matter — they are what a first release
would be versioned from, the highest bump among the commits since it wins.

Publishing the site is a separate thing and happens by itself: merge to `main` and the
Pages workflow deploys. `CLAUDE.md` has the full checklist.
