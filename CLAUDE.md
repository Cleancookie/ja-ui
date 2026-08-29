# ja-ui — instructions for AI agents

Read [`ARCHITECTURE.md`](ARCHITECTURE.md) first, then [`CONTRIBUTING.md`](CONTRIBUTING.md).

ja-ui styles **plain semantic HTML5**. There is no `.btn`, no `.card`, no `.modal`. A
`<button>` is a button, `<dialog>` is the modal, `<details>` is the accordion, `[popover]`
is the dropdown. The ground rules that are easiest to break by accident:

- **The platform first.** Before writing a component, find the element that already does
  it. A new JS module is an admission that the platform has no answer.
- **Variants are bare single-word classes** (`.primary`, `.danger`, `.outline`, `.sm`) and
  they only ever remap tokens — never write a raw `background:` in a variant rule.
- **No `!important`, anywhere.** It inverts cascade-layer order and would make the library
  beat the consumer's own CSS. If a rule is losing, it is in the wrong layer.
- **No element ships a margin**, and there are no utility classes or grid to fall back on.
- **Every colour is declared twice** — a plain fallback, then the `light-dark()` version.
- Select on ARIA *state*, never on ARIA *naming*, and never use ARIA to pick a colour.

## Commit messages

**Every commit message must start with one of these emoji.** They record the semver bump
each change carries, so that whenever the package is first released the version can be
read straight off the log. An unprefixed commit loses that.

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
🛠️ retune the press physics
📝 document the dark theme override
🔥 drop the utility classes and the grid
```

## The published site

`.github/workflows/pages.yml` builds the site from source and deploys it to GitHub Pages
on every push to `main` (Settings → Pages → source: GitHub Actions). **Merging is
deploying** — there is nothing to commit, and the Actions tab is the record of what is
live.

`docs/` is where the build lands. It is **gitignored build output**: never commit it,
never hand-edit it — edit the source in `site/`, `examples/` or `src/`.

```
npm run site        # = npm run build && npm run build-storybook && node tools/build-site.mjs
npm run site:serve  # preview the assembled docs/ on :6008
```

`npm run site` assembles `docs/` from `site/` (the landing page and `site/images/`),
`examples/`, `dist/` and the built Storybook (`storybook-static/`). Run it locally to
preview a change; the workflow runs the same thing to publish.

- `site/images/` is source, not build output. `npm run docs:images` (screenshots + GIFs,
  needs a browser) writes it, and the site build copies it to `docs/images/`.
- Keep everything base-path agnostic — the site is served from `/<repo>/`, so no
  absolute URLs (`/examples/…`) in the landing page, examples or stories.

## Shipping a change — the routine

Every change follows the same path.

The package is **not published anywhere yet** — there are no tags, no GitHub releases
and no npm package, and nothing else consumes ja-ui. So there is no version-bump or
publish step. Keep the commit emoji anyway: it is what the first release will be
versioned from.

1. **Branch, build, prove it.** `npm run build && npm run smoke`, and add a story for
   anything visual. CI runs the same.
2. **Preview the site if anything user-visible changed** — CSS, JS, examples or the
   landing page. `npm run site && npm run site:serve`. Nothing to commit: the Pages
   workflow rebuilds and deploys from source on merge. See
   [The published site](#the-published-site).
3. **Commit with an emoji prefix** — see [Commit messages](#commit-messages). It is what
   the version bump is read from, so it is not optional.
4. **Merge to `main`.** Squash or fast-forward; keep the emoji on the resulting commit.
5. **Close the issue** it came from — `gh issue close <n> --comment "..."`. A `Closes #n`
   line in the merge commit does this for you when the branch merges through a PR.
6. **Check the deploy.** The Pages workflow runs on the merge — `gh run watch` it, or
   confirm the change is live at the playground URL. Don't assume it.

## Anything else

Follow the layout and the component checklist in `CONTRIBUTING.md`, and the mapping table
and feature-gating table in `ARCHITECTURE.md`.
