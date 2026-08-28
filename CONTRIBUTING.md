# Working on ja-ui

## Ground rules

1. **No runtime dependencies.** Dev dependencies are fine; anything that ends up in
   `dist/` is not.
2. **No component ships a margin.** Spacing between things belongs to the parent.
   Components own their padding and internal `gap`, nothing more.
3. **Every visual value is a token.** If you write a colour, radius, shadow or duration
   literal inside a component, it belongs in `src/styles/base/tokens.css` instead.
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
tools/                   CSS generators, screenshots, GIFs, smoke test
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

## Releasing

Bump `version` in `package.json`, push, then publish a GitHub release. The
`publish` workflow builds and pushes the package to the GitHub npm registry.
