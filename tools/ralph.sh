#!/usr/bin/env bash
#
# ralph.sh — grind the open GitHub issues, one per iteration, until none are left.
#
#   ./tools/ralph.sh              # work every open issue
#   ./tools/ralph.sh 8 10         # work only #8 and #10, in that order
#
# Ctrl-C is safe at any point, and re-running resumes. There is no session to
# recover: the queue is "whatever `gh issue list` still says is open", so an
# issue that got fixed, pushed and closed simply is not in the queue next time.
# The only local state is an attempt counter per issue (.ralph/), which stops a
# genuinely stuck issue from being retried forever — delete .ralph/ to forget it.
#
# Knobs, all overridable from the environment:
#
#   RALPH_MODEL=opus            model for each iteration
#   RALPH_MAX_ATTEMPTS=3        give up on an issue after this many failures
#   RALPH_MAX_ITERATIONS=25     hard stop on total iterations, whatever happens
#   RALPH_PUSH=1                0 = commit locally, never push, never close
#   RALPH_PERMISSION_MODE=…     default bypassPermissions: it runs unattended
#   RALPH_DRY_RUN=1             print the queue and the prompt, run nothing
#
set -uo pipefail

cd "$(dirname "$0")/.."

MODEL="${RALPH_MODEL:-opus}"
MAX_ATTEMPTS="${RALPH_MAX_ATTEMPTS:-3}"
MAX_ITERATIONS="${RALPH_MAX_ITERATIONS:-25}"
PUSH="${RALPH_PUSH:-1}"
PERMISSION_MODE="${RALPH_PERMISSION_MODE:-bypassPermissions}"
DRY_RUN="${RALPH_DRY_RUN:-0}"

STATE=.ralph
# A dry run must not touch the real counters — give it a throwaway state dir.
[[ "$DRY_RUN" == "1" ]] && STATE="$(mktemp -d)"
LOGS="$STATE/logs"
mkdir -p "$STATE/attempts" "$LOGS"

bold=$'\e[1m'; dim=$'\e[2m'; red=$'\e[31m'; grn=$'\e[32m'; ylw=$'\e[33m'; off=$'\e[0m'
say()  { printf '%s\n' "$*"; }
rule() { printf '%s\n' "${dim}────────────────────────────────────────────────────────────${off}"; }

ITERATION=0
trap 'rule; say "${ylw}⏸  stopped after ${ITERATION} iteration(s).${off}"
      say "${dim}   re-run ./tools/ralph.sh to resume — the queue is rebuilt from gh.${off}"
      exit 130' INT TERM

# ── preflight ────────────────────────────────────────────────────────────────
command -v gh     >/dev/null || { say "${red}gh is not installed${off}"; exit 1; }
command -v claude >/dev/null || { say "${red}claude is not installed${off}"; exit 1; }
gh auth status >/dev/null 2>&1 || { say "${red}gh is not authenticated — run: gh auth login${off}"; exit 1; }

if [[ "$DRY_RUN" != "1" && -n "$(git status --porcelain)" ]]; then
  say "${red}✗ working tree is dirty.${off}"
  say "${dim}  A previous iteration may have stopped mid-fix. Commit it, or discard it"
  say "  with 'git checkout -- .', then re-run.${off}"
  git status --short
  exit 1
fi

# ── the queue ────────────────────────────────────────────────────────────────
# Rebuilt from GitHub on every run and after every iteration, so a closed issue
# leaves the queue on its own and nothing local has to be kept in sync.
queue() {
  if (( $# )); then printf '%s\n' "$@"
  else gh issue list --state open --limit 100 --json number -q '.[].number' | sort -n
  fi
}

attempts_of() { cat "$STATE/attempts/$1" 2>/dev/null || echo 0; }

# ── the prompt ───────────────────────────────────────────────────────────────
# One issue, end to end. Deliberately spells out "prove it" and "one issue only":
# an unattended agent that is vague about either will drift.
prompt_for() {
  local n=$1 attempt=$2
  cat <<PROMPT
Fix GitHub issue #${n} in this repository, end to end. This is attempt ${attempt} of ${MAX_ATTEMPTS}.

Work ONLY on #${n}. If you notice something else broken, do not fix it — open a new
issue for it with 'gh issue create' and carry on.

1. Read it: gh issue view ${n} --comments. If it links images, download them with
   curl into a scratch directory and actually look at them — these are visual bugs
   and the screenshot is usually the whole story.
2. Reproduce it first, in a browser, before changing anything. Playwright is a
   devDependency; a throwaway script under tools/ that drives dist/ or the real
   pages in examples/ is the fastest route. Measure the broken thing (computed
   styles, getBoundingClientRect) rather than eyeballing it. If you cannot
   reproduce it, say so in a comment on the issue and stop.
3. Fix the cause, not the symptom, and follow CLAUDE.md, ARCHITECTURE.md and
   CONTRIBUTING.md — layers and tokens, no !important, no wrapper elements, no
   margins on components, variants only ever remap tokens.
4. Prove it: add a regression test to tools/smoke.mjs that fails before your fix
   and passes after it. Verify that claim by stashing the fix and running the
   suite. Then run all of:
       npm run build && npm run smoke
       node tools/check-contrast.mjs
       node tools/check-examples.mjs
   Everything must pass. Add or update a story if the change is visual.
5. Delete any throwaway scripts you created.
6. Commit with the emoji prefix CLAUDE.md requires, and a body explaining the
   cause. Put "Closes #${n}" in it.
$(if [[ "$PUSH" == "1" ]]; then cat <<'PUSHY'
7. Push to main, then watch the CI and Pages runs to completion with
   'gh run watch <id> --exit-status'. If CI fails, fix it — do not leave main red.
8. Comment on the issue explaining the cause and the fix, in plain language.
PUSHY
else cat <<'NOPUSH'
7. Do NOT push and do NOT close the issue — leave the commit local for review.
NOPUSH
fi)

If you get stuck or decide the issue should not be fixed, leave a comment on the
issue saying exactly why, and leave the working tree clean. Do not push a
half-finished fix.
PROMPT
}

# ── banner ───────────────────────────────────────────────────────────────────
mapfile -t PENDING < <(queue "$@")
rule
say "${bold}ralph${off}  ${dim}$(git rev-parse --abbrev-ref HEAD) @ $(git rev-parse --short HEAD)${off}"
say "  model      ${MODEL}"
say "  push       $([[ "$PUSH" == "1" ]] && echo "${ylw}yes — commits go to main and issues get closed${off}" || echo 'no — local commits only')"
say "  attempts   ${MAX_ATTEMPTS} per issue, ${MAX_ITERATIONS} iterations max"
say "  queue      ${#PENDING[@]} open: ${PENDING[*]:-none}"
rule

# ── the loop ─────────────────────────────────────────────────────────────────
while (( ITERATION < MAX_ITERATIONS )); do
  # Re-derive every time: the last iteration may have closed more than one.
  next=''
  while read -r n; do
    [[ -z "$n" ]] && continue
    (( $(attempts_of "$n") >= MAX_ATTEMPTS )) && continue
    next="$n"; break
  done < <(queue "$@")

  if [[ -z "$next" ]]; then
    rule
    remaining=$(queue "$@" | wc -l | tr -d ' ')
    if (( remaining == 0 )); then
      say "${grn}✓ queue empty — every issue is closed.${off}"
    else
      say "${ylw}⚠ ${remaining} issue(s) left, all at the ${MAX_ATTEMPTS}-attempt cap:${off}"
      queue "$@" | while read -r n; do say "    #$n  ($(attempts_of "$n") attempts)  $LOGS/issue-$n-*.log"; done
      say "${dim}  rm -rf ${STATE} to reset the counters and try again.${off}"
    fi
    break
  fi

  ITERATION=$(( ITERATION + 1 ))
  attempt=$(( $(attempts_of "$next") + 1 ))
  log="$LOGS/issue-${next}-$(date +%Y%m%d-%H%M%S).log"

  rule
  say "${bold}▶ iteration ${ITERATION} — issue #${next}${off} ${dim}(attempt ${attempt}/${MAX_ATTEMPTS})${off}"
  say "${dim}  $(gh issue view "$next" --json title -q .title 2>/dev/null)${off}"
  say "${dim}  log: ${log}${off}"
  rule

  if [[ "$DRY_RUN" == "1" ]]; then
    prompt_for "$next" "$attempt"
    rule
    say "${dim}(dry run — nothing was executed; the queue would continue past #${next})${off}"
    echo "$MAX_ATTEMPTS" > "$STATE/attempts/$next"   # skip it, so the run terminates
    continue
  fi

  prompt_for "$next" "$attempt" \
    | claude -p --model "$MODEL" --permission-mode "$PERMISSION_MODE" --verbose 2>&1 \
    | tee "$log"

  # GitHub is the judge, not the exit code: the issue is done when it is closed.
  sleep 2
  state=$(gh issue view "$next" --json state -q .state 2>/dev/null || echo UNKNOWN)

  if [[ "$state" == "CLOSED" ]]; then
    say "${grn}✓ #${next} closed.${off}"
    rm -f "$STATE/attempts/$next"
  elif [[ "$PUSH" != "1" ]]; then
    # Nothing is expected to close in local-only mode, so one pass is the job.
    say "${grn}✓ #${next} attempted (push disabled — review the commit).${off}"
    echo "$MAX_ATTEMPTS" > "$STATE/attempts/$next"
  else
    echo "$attempt" > "$STATE/attempts/$next"
    say "${ylw}⚠ #${next} still open after attempt ${attempt}.${off}"
  fi

  if [[ -n "$(git status --porcelain)" ]]; then
    say "${red}✗ the working tree is dirty — stopping so the mess is not carried forward.${off}"
    git status --short
    say "${dim}  Commit or discard it, then re-run to resume.${off}"
    exit 1
  fi
done

rule
say "${bold}done${off} ${dim}— ${ITERATION} iteration(s), now at $(git rev-parse --short HEAD)${off}"
