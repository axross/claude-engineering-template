# Input Validation

Validate untrusted input in two modes. **Build:** parse and coerce every input at the boundary so downstream code only ever sees a known shape. **Review:** verify every untrusted input is validated before it reaches the data layer, an outbound `fetch`, or any rendering pipeline. Treat the static types at a request boundary as unverified in both modes: the runtime value may not match its declared type (e.g., a single query param may arrive as a string, an array, or `undefined`).

## Build Securely

The reliable defense is to parse untrusted input into a known shape at the boundary and pass only the parsed value onward — "parse, don't validate." A downstream guard you must remember is the one you forget.

**Guidelines:**

- MUST parse every request input (route params, query params, JSON body, form data, headers) through a schema or validation library at the boundary, then use only the parsed result downstream.
- MUST treat a boundary value's static type as a claim, not a guarantee; coerce a value that can be `string | string[] | undefined` to the exact expected shape before comparing or querying with it.
- MUST route an identifier or filter into the data layer's typed/parameterized query interface — never a string-concatenated or template-built query.
- MUST parse a data-layer record through its schema before returning it, so shape drift and non-public fields never reach a consumer.
- MUST validate a parseable input (e.g., `URL.canParse(href)`) before constructing a render node or forwarding it to a `fetch`.
- MUST restrict an upload to an allowlisted content type and rewrite its filename to a generated safe name (e.g., `${uuid}.${ext}`).
- SHOULD keep validation at the boundary rather than deep in the call stack, so every downstream caller can trust the value's shape.

## Route Inputs (params, query params)

Route and query params are the cheapest input an attacker controls — anyone crafts them in a URL — and the declared types at the boundary promise shapes the runtime never enforces.

**Guidelines:**

- MUST flag a Critical when a route param or query param value reaches a data-layer query, a `fetch` URL, or a redirect target without an explicit type assertion or validation-library parse. The static type at the boundary lies — at runtime a query value can be `string | string[] | undefined`.
- MUST flag a Major when a boolean query param is coerced via a truthy check (`if (query.flag)`) instead of value comparison (`query.flag === "true"`). The project's established pattern uses explicit value comparison — diverging risks treating a `?flag=false` value as truthy.
- MUST flag a Critical when a dynamic segment (e.g., an identifier path param) is passed into an equality filter without ensuring it is a string. An array value can bypass an equals filter.

## Server Actions and Request Handlers

Request bodies and form data arrive from arbitrary clients, so the handler's parameter types describe intent, not what actually shows up at runtime.

**Guidelines:**

- MUST flag a Critical when a new request handler reads a JSON body, form data, or the request URL without a schema (or equivalent runtime check) validating the parsed shape before use.
- MUST flag a Critical when a new server-side callable invoked from the client accepts arguments without runtime validation, regardless of static types.
- MUST flag a Major when a request handler or server-side callable returns data-layer records directly without first parsing them through the appropriate schema. Direct return leaks fields the consumer did not request and may include non-public fields.

## Data Layer

Stored records drift from the code's expectations — schema migrations, older writes, and hand-edited rows all produce shapes the static types no longer describe.

**Guidelines:**

- MUST flag a Critical when a new data-access function does not run a schema `parse(…)` or `safeParse(…)` on the result before returning. The project's pattern is to define a schema transform per record shape and parse before return.
- MUST flag a Major when a safe-parse failure is **silently** dropped in production code (no warning log). The established pattern logs the failure with enough context (identifier and flattened error) to debug — match it.
- MUST flag a Critical when a data-layer query filter is built by string concatenation, template literal, or anything other than the data layer's typed/parameterized query interface. The typed filter interface IS the safe boundary; building it dynamically with untrusted keys is the injection-equivalent path.

## Rendering Pipeline Inputs

The rendering pipeline's safety argument rests entirely on where its input comes from, so a new feed path invalidates that argument even when the pipeline code is untouched.

**Guidelines:**

- MUST flag a Critical when a new code path passes user-supplied content into the rendering pipeline without going through the sanctioned content loader (which loads from the trusted data layer, never the filesystem or arbitrary HTTP). The pipeline assumes its input came from the trusted source.
- MUST flag a Major when a new custom render node or transform reads attribute values without validating them — the established pattern validates parseable inputs (e.g., `URL.canParse(href)`) before constructing the node.

## File Uploads

An uploaded file is attacker-controlled bytes the server stores and later serves back, so type and filename restrictions are what separate an image host from a malware host.

**Guidelines:**

- MUST flag a Critical when a new upload-accepting resource lacks a content-type (MIME) filter when the resource accepts user-uploaded files. The established pattern restricts accepted types — match it.
- MUST flag a Major when a new upload resource does not enforce filename sanitization. The established upload hooks rewrite the uploaded filename to a generated, safe name (e.g., `${uuid}.${ext}`) — match the pattern.
