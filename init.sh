#!/usr/bin/env bash
#
# init.sh — scripted, metacharacter-safe token substitution for this template.
#
# This automates the mechanical half of INIT (Step 3): replacing every {{TOKEN}}
# with the project's value. It does NOT make the judgement calls — interviewing
# the user, choosing which skills to install, resolving the remaining optional
# sections, and writing docs/ are still done by following INIT.md. Run this
# AFTER you have the answers.
#
# Why a script instead of `sed`: two tokens ({{CODE_FILE_GLOB}},
# {{CODE_FILE_REGEX}}) contain shell/regex metacharacters ( | * ( ) \ $ ), which
# break a naive `sed s|...|...|` sweep. This script substitutes literally.
#
# Usage:
#   ./init.sh init     # write init.values.json (a fill-in-the-blanks template)
#   ./init.sh apply    # substitute tokens from init.values.json, then verify
#   ./init.sh check    # just run the gate + link check, change nothing
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
VALUES="init.values.json"
MANIFEST="tokens.json"

command -v python3 >/dev/null 2>&1 || { echo "python3 is required" >&2; exit 1; }

case "${1:-}" in
  init)
    if [ -f "$VALUES" ]; then
      echo "$VALUES already exists; edit it, then run: ./init.sh apply" >&2
      exit 1
    fi
    python3 - "$MANIFEST" "$VALUES" <<'PY'
import json, sys
manifest, out = sys.argv[1], sys.argv[2]
data = json.load(open(manifest))
obj = {}
for t in data["tokens"]:
    tag = "  # OPTIONAL: " if t["optional"] else "  # "
    obj[t["name"]] = ""  # value to fill
# Emit with description comments alongside each key.
lines = ["{"]
items = data["tokens"]
for i, t in enumerate(items):
    comma = "," if i < len(items) - 1 else ""
    opt = "(optional) " if t["optional"] else ""
    lines.append(f'  "{t["name"]}": ""{comma}'
                 f'  // {opt}{t["description"]} e.g. {t["example"]}')
lines.append("}")
open(out, "w").write("\n".join(lines) + "\n")
PY
    echo "Wrote $VALUES — fill in each value (// comments are stripped on apply),"
    echo "then run: ./init.sh apply"
    ;;

  apply)
    [ -f "$VALUES" ] || { echo "$VALUES not found; run: ./init.sh init" >&2; exit 1; }
    python3 - "$MANIFEST" "$VALUES" <<'PY'
import json, os, sys

manifest, values = sys.argv[1], sys.argv[2]
tokens = [t["name"] for t in json.load(open(manifest))["tokens"]]

# Tolerant JSON read: strip // line comments the user may leave in the
# template. A comment starts at the first // that sits OUTSIDE a quoted
# string (tracked with quote/escape state), so a VALUE containing // — a
# URL, a "value // note", anything — is never touched.
def strip_line_comments(text):
    out = []
    for line in text.split("\n"):
        in_string = escaped = False
        cut = None
        for i, ch in enumerate(line):
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == '"':
                in_string = not in_string
            elif ch == "/" and not in_string and line[i : i + 2] == "//":
                cut = i
                break
        if cut is not None:
            line = line[:cut].rstrip()
        out.append(line)
    return "\n".join(out)

vals = json.loads(strip_line_comments(open(values).read()))

missing = [t for t in tokens if not vals.get(t, "").strip()]
if missing:
    sys.stderr.write("Refusing to apply — these tokens have no value in %s:\n  %s\n"
                     % (values, ", ".join(missing)))
    sys.stderr.write("Fill them, or delete the section that uses an optional one "
                     "(see INIT.md Step 4) and remove its row from tokens.json.\n")
    sys.exit(1)

SKIP = {".git", "node_modules", ".next", "dist", "build", "out", "coverage", ".venv", "tools"}
SKIP_FILES = {"tokens.json", "init.values.json", "init.sh", "INIT.md", "README.md"}

def replace_literal(text):
    for name in tokens:
        text = text.replace("{{%s}}" % name, vals[name])  # literal, metachar-safe
    return text

changed = 0
for dirpath, dirnames, filenames in os.walk("."):
    dirnames[:] = [d for d in dirnames if d not in SKIP]
    for fn in filenames:
        if fn in SKIP_FILES:
            continue
        if not fn.endswith((".md", ".sh", ".json", ".yaml", ".yml")):
            continue
        path = os.path.join(dirpath, fn)
        src = open(path, encoding="utf-8").read()
        new = replace_literal(src)
        if new != src:
            open(path, "w", encoding="utf-8").write(new)
            changed += 1
print("Substituted tokens in %d files." % changed)
PY
    echo
    "$ROOT/init.sh" check
    ;;

  check)
    echo "== Gate: any {{TOKEN}} left in authored files? =="
    # Match the UPPER_CASE token shape (digits included: E2E_TEST_CMD), not
    # bare '{{': GitHub Actions ${{ ... }} expressions in .github/ contain
    # '{{' but are lowercase, so workflows can be scanned for leftover tokens
    # without false positives.
    if grep -rnE '\{\{[A-Z][A-Z0-9_]*\}\}' . \
        --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.next \
        --exclude-dir=dist --exclude-dir=build --exclude-dir=out \
        --exclude-dir=coverage \
        --exclude=tokens.json --exclude=init.values.json --exclude=init.sh \
        --exclude=INIT.md --exclude=README.md 2>/dev/null; then
      echo "  ^ tokens remain — fill them or remove the owning section."
    else
      echo "  none remain."
    fi
    echo
    echo "== Optional sections still present (decide ADD vs DELETE — INIT Step 4) =="
    grep -rn 'INIT:OPTIONAL' . \
      --exclude-dir=.git --exclude-dir=node_modules \
      --exclude=INIT.md --exclude=init.sh --exclude=README.md --exclude=tokens.json 2>/dev/null \
      || echo "  none remain."
    echo
    echo "== README seed (INIT.md Step 7) =="
    # README.md itself is excluded from the token gate above: pre-finalize it
    # is the template's own README, whose prose legitimately mentions the
    # {{TOKEN}} convention. The seed (README.template.md) IS covered by the
    # gate; once it is renamed over README.md, scan the result here instead.
    if [ -f README.template.md ]; then
      echo "  README.template.md still present — finalize it into README.md."
    elif [ -f README.md ] && grep -nE '\{\{[A-Z][A-Z0-9_]*\}\}|<!-- INIT' README.md; then
      echo "  ^ leftover tokens / INIT comments in README.md — finish the Step-7 finalize."
    else
      echo "  finalized."
    fi
    echo
    echo "== Relative-link integrity =="
    # The checker ships inside the installed agent-skill-authoring skill and
    # survives adaptation; it needs Node, which refreshing skills needs anyway.
    if command -v node >/dev/null 2>&1; then
      # `|| true`: check reports every section rather than aborting on the
      # first failing one, so one run shows the whole remaining worklist.
      node "$ROOT/.claude/skills/agent-skill-authoring/scripts/check-links.mjs" || true
    else
      echo "  SKIPPED — node not found. Relative links were NOT checked."
    fi
    echo
    echo "== docs/ validators =="
    # Five single-purpose validators, one per kind of change; there is no
    # run-all script by design. All five exit 0 while docs/index.md is absent,
    # so this section is inert until the project adopts docs/ (INIT Step 5).
    if command -v node >/dev/null 2>&1; then
      docs_failed=0
      for check in "$ROOT"/.claude/skills/living-project-documentation/scripts/check-*.mjs; do
        node "$check" || docs_failed=1
      done
      # same reason as above: report, do not abort the run.
      [ "$docs_failed" -eq 0 ] || echo "  ^ fix the findings above."
    else
      echo "  SKIPPED — node not found. docs/ was NOT checked."
    fi
    ;;

  *)
    sed -n '3,33p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
    exit 1
    ;;
esac
