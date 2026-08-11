# Injection and Output Encoding

Turn untrusted (user- or CMS-authored) content — rich text, markdown, or HTML — into markup without letting it inject script or break out of the output encoding, in two modes. **Build:** render through the framework's safe, context-aware sinks and encode at each sink. **Review:** verify a change does not open a raw-HTML sink or bypass the encoding path. The markdown renderer is one common instance; the same rules apply to any pipeline that turns authored content into markup.

## Build Securely

Output encoding is contextual: the same string is inert as HTML text but live as a URL, an attribute, a script, or a style. Safety comes from letting the framework encode for the exact sink, not from cleaning the input once.

**Guidelines:**

- MUST render untrusted content through the framework's default text sinks (`textContent`, JSX children, a template's auto-escaped interpolation), never a raw-HTML sink (`dangerouslySetInnerHTML`, `innerHTML`, `v-html`, `outerHTML`).
- MUST let the framework encode per output context (HTML body, attribute, URL, JS, CSS) rather than hand-rolling encoding or concatenating strings into markup — encoding for the wrong context is no protection.
- MUST allowlist URL schemes to `http:`/`https:` (plus `mailto:`/`tel:` where the content needs them) and strip `javascript:`, `data:`, and unknown schemes before a value reaches an `href`, `src`, or `style` sink.
- MUST sanitize with a vetted, maintained HTML sanitizer (e.g., DOMPurify) when a feature genuinely must render authored HTML, rather than trusting the raw string.
- MUST forward only a known-safe attribute allowlist (e.g., `href`, `title`) from a custom render node, never spread authored-controlled attributes onto a DOM element, and never emit event-handler attributes (`onClick`, `onError`).
- MUST keep untrusted content flowing only from the trusted data/content layer — not the filesystem or arbitrary HTTP at runtime — and keep the input format as constrained as the feature allows.
- SHOULD render an external link with the project's safe-link pattern where it defines one, and otherwise with `rel="noopener noreferrer"` and `target="_blank"`.

## Pipeline Configuration to Watch

A rendering pipeline that turns authored content into markup typically has a few dangerous knobs. Identify the project's equivalents and watch for changes to them:

- A "dangerous protocols allowed" setting (e.g., not stripping `javascript:`/`data:` URLs at parse time). This is only safe if the downstream rendering layer reliably encodes the value when it lands in an attribute.
- An unknown-node handler that reports rather than throwing (a silently-permissive fallback can let unexpected node types through).
- A final stage that converts the parsed tree into framework components / DOM, relying on the framework's automatic encoding.

**Guidelines:**

- MUST review rendering-pipeline changes against the current dangerous-protocol handling, unknown-node handling, and output-encoding guarantees.

## What the Reviewer MUST Flag

Raw-HTML sinks bypass the one defense the rendering layer provides — automatic output encoding — so a single use undoes the safety of the entire pipeline.

**Guidelines:**

- MUST flag a Critical when a new render component uses a raw-HTML sink (e.g., `dangerouslySetInnerHTML` / `innerHTML`) for any prop derived from the authored content.
- MUST flag a Critical when a new custom render node emits an element whose attributes include event handlers (`onClick`, `onError`, etc.). Safe handlers forward only known scalar attributes (e.g., `href`, `title`); a node that copies arbitrary attributes is unsafe.
- MUST flag a Critical when a rendered element is produced through manual string concatenation, raw-string templating, or any path that bypasses the framework's output encoding.
- MUST flag a Major when "dangerous protocols allowed" is enabled and then the compensating control is removed — if the dangerous-protocol setting is turned on, there MUST be a hand-rolled URL allowlist (or the rendering layer's encoding must be proven to neutralize it). Legitimate content often needs `mailto:` and `tel:` links, so the safe path is an allowlist, not a blanket allow.

## Custom Render Nodes / Directives

Every custom node hand-generates markup outside the pipeline's normal path, so it re-assumes responsibility for encoding guarantees the pipeline otherwise provides for free.

**Guidelines:**

- MUST flag a Critical when a new custom node's component renders unescaped HTML from any authored attribute or child value.
- MUST flag a Critical when a new node accepts user-controlled HTML in an attribute and assigns it to a sink such as `style={…}`, `srcSet`, or a raw-HTML prop.
- MUST flag a Major when a node emits an `<a>` tag for an external URL without `rel="noopener noreferrer"` and `target="_blank"`, or without the project's established safe-link pattern where it defines one.

## Image / Media Sources

The host allowlist is the only gate between authored URLs and the media pipeline, so a render path that skips it makes user-controlled input the entire boundary. Some optimized-image components have an "unoptimized" escape hatch that skips the host-allowlist check — that escape hatch is the only host gate, so bypassing it on user-controlled URLs is unsafe.

- A pre-existing component may already pass an external authored image URL through such an escape hatch — that is a known risk the reviewer should be aware of, not flag again unless the diff worsens it (e.g., removes a metadata/source filter, or promotes the image to an eagerly-preloaded position).

**Guidelines:**

- MUST flag a Critical when a new component renders a media element with an authored-content-derived source that bypasses the host-allowlist check (e.g., via an "unoptimized" / raw `<img>` escape hatch) without an allowlist check.

## Framework-Specific Pitfalls

Framework auto-encoding is contextual — the same string is inert as text content but live as a URL or attribute — so proof of safety in one sink proves nothing about another.

**Guidelines:**

- MUST flag a Critical when a value derived from authored content is auto-encoded in one place (e.g., a list key) but the same value is also rendered into a URL/attribute sink without canonicalization, so it still flows unencoded to the DOM.
- MUST flag a Major when a new component spreads authored-content-controlled attributes directly onto a DOM element without filtering to a known-safe attribute allowlist.

## Bypass Paths

A constrained input format is itself a security control: every capability the format cannot express is an attack the pipeline never has to defend against.

**Guidelines:**

- MUST flag a Critical when new code processes raw HTML through a pipeline that previously accepted only a constrained format — that widens the attack surface to anything the HTML layer accepts.
- MUST flag a Critical when a new module loads authored content from the filesystem or arbitrary HTTP at runtime — the project rule is that all such content comes from the trusted data/content layer.
