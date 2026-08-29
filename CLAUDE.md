# ja-ui — instructions for AI agents

Read `CONTRIBUTING.md` first: it holds the ground rules (zero runtime dependencies, no
component margins, every visual value a token, Bootstrap class names with `data-ja-*`
hooks, generated CSS is not hand-edited).

## Commit messages

**Every commit message must start with one of these emoji.** They record the semver
bump each change carries, so that whenever the package is first released the version
can be read straight off the log. An unprefixed commit loses that.

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
- The bump for a release is the **highest** bump across the commits since the last
  release: one 🔥 makes the whole release major.
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

## Shipping a change — the routine

Every change follows the same path. Do all of it; a half-done change leaves the
published site stale against `src/`.

The package is **not published anywhere yet** — there are no tags, no GitHub releases
and no npm package, and nothing else consumes ja-ui. So there is no version-bump or
publish step. Keep the commit emoji anyway: it is what the first release will be
versioned from.

1. **Branch, build, prove it.** `npm run build && npm run smoke`, and add a story for
   anything visual. CI runs the same, and fails if `src/styles/generated` is out of date
   (`npm run gen` and commit the result).
2. **Rebuild the site if anything user-visible changed** — CSS, JS, examples or the
   landing page. `npm run site`, then commit the resulting `docs/`. GitHub Pages serves
   that folder off `main`, so an un-rebuilt `docs/` is a stale published site. See
   [The published site](#the-published-site-docs).
3. **Commit with an emoji prefix** — see [Commit messages](#commit-messages). It is what
   the version bump is read from, so it is not optional.
4. **Merge to `main`.** Squash or fast-forward; keep the emoji on the resulting commit.
5. **Close the issue** it came from — `gh issue close <n> --comment "..."`. A `Closes #n`
   line in the merge commit does this for you when the branch merges through a PR.
6. **Check the published site.** Pages rebuilds on push to `main`; confirm the change is
   actually live at the playground URL rather than assuming it.

## Anything else

Follow the layout and the component checklist in `CONTRIBUTING.md`.
