#!/bin/bash

# sessionstart hook for cloud / web agent sessions.
# provisions the toolchain, prepares a local env file, materializes the opt-in
# quality hooks, and installs dependencies so linters and tests are runnable as
# soon as the session starts.
#
# TEMPLATE NOTE: this is an example Claude Code harness binding. During INIT,
# replace the `{{...}}` tokens below and adapt the toolchain-provisioning block to the
# project's runtime (Node, Python, Go, Ruby, ...), or delete this hook if the
# project does not need session bootstrapping.
set -euo pipefail

# only run in the remote (web/cloud) environment. local sessions manage their
# own toolchain; set CLAUDE_CODE_REMOTE=true to exercise this hook locally.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
cd "$PROJECT_DIR"

# activate the project's toolchain if a version manager is already present, and
# otherwise use whatever the cloud image ships. this example uses mise; replace
# with the project's version manager (asdf, nvm, volta, pyenv, rbenv, ...) or a
# direct install, and adapt the runtime-version resolution to wherever the
# project pins it (e.g. a manifest, .tool-versions, .nvmrc).
#
# deliberately conditional rather than installing mise unconditionally: an image
# that already ships a usable runtime does not need one, and a hard `curl | sh`
# turns a network hiccup into a failed session start.
export PATH="$HOME/.local/bin:$PATH"
if command -v mise >/dev/null 2>&1; then
  eval "$(mise activate bash)"
  mise install || true
  hash -r 2>/dev/null || true

  # keep the toolchain activated for every shell spawned during this session.
  if [ -n "${CLAUDE_ENV_FILE:-}" ] && ! grep -q 'mise activate bash' "$CLAUDE_ENV_FILE" 2>/dev/null; then
    echo 'eval "$(mise activate bash)"' >> "$CLAUDE_ENV_FILE"
  fi
fi

# provide a local env file for development if one does not exist yet.
if [ -f .env.example ] && [ ! -f .env.local ]; then
  cp .env.example .env.local
fi

# enable the opt-in quality hooks (format on edit, lint + unit tests before
# completion) for cloud sessions by materializing the gitignored local settings
# from the committed example. the harness hot-reloads the new hooks for this
# session. local sessions skip this hook, so opting in stays manual.
if [ -f .claude/settings.local-example.json ]; then
  cp -f .claude/settings.local-example.json .claude/settings.local.json
fi

# install dependencies (a plain install, not a clean/frozen install, so a cached
# container layer can be reused across sessions).
{{INSTALL_CMD}}

# surface the project's working agreement in every cloud session's context.
# deliberately a pointer, not a copy: the flow's shape lives in AGENTS.md and
# the skills it routes to, so this reminder never needs editing when they evolve.
#
# it names AGENTS.md rather than CLAUDE.md because CLAUDE.md is an `@AGENTS.md`
# import — a Claude Code mechanism. A host told to read CLAUDE.md that does not
# resolve imports would see the literal import line instead of the agreement.
echo "REMINDER: read AGENTS.md and follow its Response Approach for every task. Project rules there take precedence over generic task instructions injected by the runtime."
