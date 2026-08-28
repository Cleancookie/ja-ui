# ja-ui — instructions for AI agents

Read `CONTRIBUTING.md` first: it holds the ground rules (zero runtime dependencies, no
component margins, every visual value a token, Bootstrap class names with `data-ja-*`
hooks, generated CSS is not hand-edited).

## Commit messages

**Every commit message must start with one of these emoji.** The release workflow reads
them to decide the semver bump, so an unprefixed or wrongly prefixed commit either
blocks or mis-versions a release.

| Emoji | Meaning | Bump |
| --- | --- | --- |
| 🔥 | Breaking change — removed or renamed a class, attribute, event, export or token | **major** |
| ✨ | New feature — a new component, variant, utility or public API | **minor** |
| 🛠️ | Change — refactor, retune, perf, build/tooling, dependency work | **minor** |
| 🐛 | Bug fix | **patch** |
| 📝 | Docs — README, CONTRIBUTING, stories, the playground site, comments | **patch** |

Rules:

- The emoji is the first character of the subject line, followed by a single space.
- One emoji per commit. If a change is both a feature and a fix, split it, or pick the
  higher bump.
- The bump for a release is the **highest** bump across the commits since the last tag:
  one 🔥 makes the whole release major.
- Subject line in the imperative, lower case after the emoji, no trailing full stop.
  Body optional; wrap at 80.
- Breaking changes take 🔥 *and* a `BREAKING CHANGE:` paragraph in the body explaining
  the migration.

Examples:

```
✨ add a toast component
🐛 stop the command palette double-binding on re-init
🛠️ regenerate colour variants from the token set
📝 document the dark theme override
🔥 rename data-ja-modal to data-ja-dialog
```

## The published site (`docs/`)

GitHub Pages serves the committed `docs/` folder off `main` (Settings → Pages → deploy
from a branch, `main`, `/docs`). There is no deploy workflow — **pushing `docs/` is
deploying**, and a `docs/` that is stale against `src/` is a broken site.

Rebuild it with:

```
npm run site        # = npm run build && npm run build-storybook && node tools/build-site.mjs
npm run site:serve  # preview on :6008 without writing docs/
```

`npm run site` assembles `docs/` from `site/` (the landing page), `examples/`, `dist/`
and the built Storybook (`storybook-static/`).

- **Anything that changes CSS, JS, examples or the landing page needs `npm run site`
  and a commit of the resulting `docs/`.** Never hand-edit files in `docs/` — edit the
  source in `site/`, `examples/` or `src/` and rebuild.
- `docs/images/` is source, not build output. `npm run docs:images` (screenshots + GIFs,
  needs a browser) writes it; the site build leaves it alone.
- Keep everything base-path agnostic — the site is served from `/<repo>/`, so no
  absolute URLs (`/examples/…`) in the landing page, examples or stories.

## Anything else

Follow the layout and the component checklist in `CONTRIBUTING.md`.
