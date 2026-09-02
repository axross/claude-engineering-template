#!/bin/bash

# posttooluse hook: formats the project after a code change so written files
# stay consistent. fires on edit/write tools.
#
# TEMPLATE NOTE: this is an example Claude Code harness binding. During INIT,
# replace the `{{...}}` tokens below with the project's real values, or delete this
# hook (and its entry in .claude/settings.local-example.json) if the project
# has no formatter. CODE_FILE_GLOB, PACKAGE_MANAGER, and FORMAT_CMD are
# required; LINT_FIX_CMD and LINT_FIX_FILE_GLOB are optional — dropping both
# means editing two places: remove ` | {{LINT_FIX_FILE_GLOB}}` from the
# early-exit filter below, and delete the lint-autofix case block further
# down that uses LINT_FIX_CMD and LINT_FIX_FILE_GLOB.
set -uo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
# normalize away a trailing slash so the "$PROJECT_DIR"/… guard below
# matches reliably regardless of how PROJECT_DIR was supplied.
PROJECT_DIR="${PROJECT_DIR%/}"

# read the edited file path from the tool payload on stdin.
FILE_PATH="$(jq -r '.tool_input.file_path // empty' 2>/dev/null || true)"

# run below only when this file is one either action cares about; skip the
# rest. the pattern is the union of two tokens — CODE_FILE_GLOB (e.g.
# "*.ts | *.tsx | *.js | *.css"), which {{FORMAT_CMD}} below always runs for,
# and LINT_FIX_FILE_GLOB (e.g. "*.md"), which only the lint-autofix step
# further down acts on. naming both here is required, not redundant:
# {{FORMAT_CMD}} is a whole-project formatter with no file argument, so
# running it for a LINT_FIX_FILE_GLOB-only file is correct, but a filter
# narrowed to CODE_FILE_GLOB alone would exit before either action ever saw
# the file.
case "$FILE_PATH" in
  {{CODE_FILE_GLOB}} | {{LINT_FIX_FILE_GLOB}}) ;;
  *) exit 0 ;;
esac

cd "$PROJECT_DIR"

# make the project's toolchain available if a version manager is installed
# (e.g. mise, asdf, nvm, volta). adapt or remove to match the project.
export PATH="$HOME/.local/bin:$PATH"
if command -v mise >/dev/null 2>&1; then
  eval "$(mise activate bash)"
fi

# skip silently when the package manager is unavailable (e.g. a local shell
# without the toolchain provisioned).
command -v {{PACKAGE_MANAGER}} >/dev/null 2>&1 || exit 0

# use a PROJECT_DIR-relative path, not the absolute one (an absolute path
# commonly bypasses the linter's own ignore configuration); the
# "$PROJECT_DIR"/… guard also excludes a file outside the project root.
# {{LINT_FIX_FILE_GLOB}} is the token below (cf. the CODE_FILE_GLOB comment
# above).
case "$FILE_PATH" in
  "$PROJECT_DIR"/{{LINT_FIX_FILE_GLOB}})
    FILE_REL="${FILE_PATH#"$PROJECT_DIR"/}"
    FILE_REL="${FILE_REL#/}"
    {{LINT_FIX_CMD}} "$FILE_REL" >/dev/null 2>&1 || true
    ;;
esac

{{FORMAT_CMD}} >/dev/null 2>&1 || true
exit 0
