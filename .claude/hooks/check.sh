#!/bin/bash

# stop hook: before the task completes, run the unit tests and lint whenever
# code changed in this session. failures block completion and are reported back
# on stderr so the agent addresses them before finishing.
#
# TEMPLATE NOTE: this is an example Claude Code harness binding. During INIT,
# replace the `{{...}}` tokens below with the project's real values, or delete this
# hook (and its entry in .claude/settings.local-example.json) if the project
# has no automated checks.
set -uo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
cd "$PROJECT_DIR"

# make the project's toolchain available if a version manager is installed
# (e.g. mise, asdf, nvm, volta). adapt or remove to match the project.
export PATH="$HOME/.local/bin:$PATH"
if command -v mise >/dev/null 2>&1; then
  eval "$(mise activate bash)"
fi

# nothing to verify without the package manager.
command -v {{PACKAGE_MANAGER}} >/dev/null 2>&1 || exit 0

# only run when this session has pending code changes, either uncommitted or
# committed but not yet on the upstream branch. avoids checking on plain
# conversational turns. CODE_GLOB below is the CODE_FILE_REGEX token, an
# extended-regex of source extensions, e.g. '\.(ts|tsx|js|css)$'.
CODE_GLOB='{{CODE_FILE_REGEX}}'
code_changed() {
  if git status --porcelain 2>/dev/null | grep -qE "$CODE_GLOB"; then
    return 0
  fi
  local upstream
  upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)"
  if [ -n "$upstream" ] && git diff --name-only "$upstream...HEAD" 2>/dev/null | grep -qE "$CODE_GLOB"; then
    return 0
  fi
  return 1
}
# resolve the default branch instead of assuming a name, so the reminder below
# works on a repository whose default is not `main`.
default_branch() {
  git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null && return 0
  for candidate in origin/main origin/master; do
    if git rev-parse --verify -q "$candidate" >/dev/null; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

# non-blocking change-loop reminder: stopping with pushed commits ahead of the
# default branch means a change-loop run is in flight, including when the tree
# is clean and fully pushed — the push-then-stop state the code_changed gate
# above would otherwise skip. the hook cannot query GitHub for an open pull
# request, so it reminds conditionally instead of blocking, via a systemMessage.
change_in_flight() {
  local branch base upstream
  branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
  base="$(default_branch)" || return 1
  [ -n "$branch" ] && [ "$branch" != "${base#origin/}" ] || return 1
  upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)"
  [ -n "$upstream" ] || return 1
  # commits exist beyond the default branch, and every one of them is pushed.
  [ -n "$(git rev-list "$base"..HEAD -n 1 2>/dev/null)" ] || return 1
  [ -z "$(git rev-list "$upstream"..HEAD -n 1 2>/dev/null)" ] || return 1
  return 0
}

emit_reminder_and_exit() {
  if change_in_flight; then
    printf '%s\n' '{"systemMessage": "Reminder: pushed commits are ahead of the default branch on this branch. If no pull request with an independent review exists for them, the change loop is incomplete — do not report this work as done."}'
  fi
  exit 0
}

code_changed || emit_reminder_and_exit

# run both checks, collecting output for the failure report.
OUTPUT="$(mktemp)"
STATUS=0
if ! {{UNIT_TEST_CMD}} >>"$OUTPUT" 2>&1; then STATUS=1; fi
if ! {{LINT_CMD}} >>"$OUTPUT" 2>&1; then STATUS=1; fi

if [ "$STATUS" -ne 0 ]; then
  {
    echo "Pre-completion checks failed ({{UNIT_TEST_CMD}} / {{LINT_CMD}})."
    echo "Fix the errors below before completing the task:"
    echo
    tail -n 100 "$OUTPUT"
  } >&2
  rm -f "$OUTPUT"
  exit 2
fi

rm -f "$OUTPUT"
emit_reminder_and_exit
