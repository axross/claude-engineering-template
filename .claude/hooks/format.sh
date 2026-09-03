#!/bin/bash

# posttooluse hook: formats the project after a code change so written files
# stay consistent. fires on edit/write tools.
#
# TEMPLATE NOTE: this is an example Claude Code harness binding. During INIT,
# replace the `{{...}}` tokens below with the project's real values, or delete this
# hook (and its entry in .claude/settings.local-example.json) if the project
# has no formatter. CODE_FILE_GLOB, PACKAGE_MANAGER, and FORMAT_CMD are
# required; LINT_FIX_CMD and LINT_FIX_FILE_GLOB are optional — see INIT.md
# for what dropping both involves.
set -uo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
# normalize away a trailing slash so the "$PROJECT_DIR"/… guard below
# matches reliably regardless of how PROJECT_DIR was supplied.
PROJECT_DIR="${PROJECT_DIR%/}"

# read the edited file path from the tool payload on stdin.
FILE_PATH="$(jq -r '.tool_input.file_path // empty' 2>/dev/null || true)"

# skip below unless this file matters to either action. the pattern unions
# CODE_FILE_GLOB and LINT_FIX_FILE_GLOB — narrowing to CODE_FILE_GLOB alone
# would exit before FORMAT_CMD (whole-project, no file argument) ever ran
# for a LINT_FIX_FILE_GLOB-only file. LINT_FIX_FILE_GLOB is anchored to
# "$PROJECT_DIR"/, matching the autofix guard below, since the per-file
# autofix needs a project-relative path; CODE_FILE_GLOB stays unanchored,
# as FORMAT_CMD takes none.
case "$FILE_PATH" in
  {{CODE_FILE_GLOB}} | "$PROJECT_DIR"/{{LINT_FIX_FILE_GLOB}}) ;;
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

# use a PROJECT_DIR-relative path, not the absolute one — an absolute path
# commonly bypasses the linter's own ignore configuration.
case "$FILE_PATH" in
  "$PROJECT_DIR"/{{LINT_FIX_FILE_GLOB}})
    FILE_REL="${FILE_PATH#"$PROJECT_DIR"/}"
    FILE_REL="${FILE_REL#/}"
    {{LINT_FIX_CMD}} "$FILE_REL" >/dev/null 2>&1 || true
    ;;
esac

{{FORMAT_CMD}} >/dev/null 2>&1 || true
exit 0
