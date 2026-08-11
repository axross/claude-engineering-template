# E2E Test Conventions

_Code examples use Playwright APIs (`getByTestId`, `getByRole`, `expect.poll`, `test.step`) as the concrete form. Translate them to the project's runner; the conventions in the prose are framework-neutral._

## Locator Fallback Hierarchy

Elements are targeted by stable test-id hooks scoped through their container, so copy edits and markup reshuffles never break a spec. When a hook is missing, the fallback order goes through accessibility, then copy: role-based locators cover accessible controls that cannot carry a test id, and text matching is reserved for assertions about the copy itself. Document structure is a last resort reserved for DOM the project cannot instrument.

The same ordering applies across UI stacks:

| Priority       | Web (Playwright/Cypress)                 | Mobile (Maestro/Detox)                |
| -------------- | ---------------------------------------- | ------------------------------------- |
| 1. stable hook | `getByTestId()` / `data-testid`          | `id:` selector matching `testID`      |
| 2. role/name   | `getByRole()` by accessible name         | accessibility label match             |
| 3. copy        | `getByText()` — only when asserting copy | text match — only when asserting copy |
| 4. structural  | scoped CSS `locator()` — last resort     | relative selectors (`below`, `index`) |

**Guidelines:**

- MUST use the runner's stable test-id locator as the default for locating elements.
- MUST use kebab-case for test IDs.
- MUST use chained/scoped locators to narrow scope — for example, scope a header lookup to its page container instead of querying the header globally.
- MUST use role-based locators, matching by accessible name, for accessible controls (buttons, options, menu items) that cannot carry a test id — for example, elements portaled out of the component's own markup.
- MUST NOT use text-matching locators except when the assertion is about the copy itself, such as an empty-state message.
- MUST add a new test id to the component when no stable hook exists rather than reaching for a structural selector.
- MAY scope a structural locator inside a test-id-anchored container as a last resort for third-party-rendered DOM the project cannot instrument; leave a comment naming why no stable hook was possible.

**Example:**

```ts
import { expect, type Locator, test } from "@playwright/test";

test("Item summary section", async ({ page }) => {
  const itemPage = page.getByTestId("page");
  let summary: Locator;

  await test.step("Verify the title", async () => {
    summary = itemPage.getByTestId("summary");

    await expect(summary.getByTestId("title")).toBeVisible();
  });

  await test.step("Verify the action links", async () => {
    const actions = summary.getByTestId("actions");

    // Portaled out of the component's markup: match by role, not a test id.
    await expect(actions.getByRole("link", { name: "Share" })).toBeVisible();
  });
});
```

Protocol / HTTP-level suites have no locators: address an operation by its API identity (tool name, endpoint, method) and assert the response contract instead. See [test-environment.md](./test-environment.md).

## Assertions

Prefer the runner's native auto-waiting assertions (visibility, focus, attribute, class, text, count, HTTP status) over pulling state back into the test for manual comparison. Native assertions auto-wait and produce clearer failure messages; assert focus directly on the locator instead of reading `document.activeElement` and comparing it yourself.

Assert the outcome the user or client observes — the visible UI, or the tool/response contract — not server internals. Keep copy assertions as loose as correctness allows so unrelated wording edits do not break the test.

**Guidelines:**

- MUST prefer native auto-waiting assertions over evaluating state and comparing it manually in the test.
- MUST assert the user- or client-observable outcome (rendered UI, HTTP status/body, tool result), not internal log lines or private identifiers.
- SHOULD keep text-fragment assertions loose (a substring or pattern) rather than full-string equality when the exact copy is not the thing under test.
- MUST read state inside an in-context evaluation only when no native assertion covers it (a computed style, a pseudo-element property), and wrap that read in a polling helper (see the next section).

**Example — assert the contract, keep copy loose:**

```ts
// CORRECT — the outcome the caller sees
expect(result.isError).toBe(true);
expect(result.content).toMatchObject([
  { type: "text", text: expect.stringContaining("Refusing to fetch") },
]);

// WRONG — coupling to internals the contract does not expose
expect(serverLogLines).toContain("url-guard rejected");
```

## Waiting: Poll, Never Sleep

A fixed sleep is the primary source of e2e flakiness: too short and the test races the app on a slow machine, too long and the suite crawls, and either way the number is a guess that rots. Native auto-waiting assertions already retry until a deadline. For state no native assertion covers — scroll position, computed styles, a hydration flag, an animation or transition settling — re-sample the value until it reaches the expected state, bounded by a timeout.

**Guidelines:**

- MUST NOT use a fixed sleep (`waitForTimeout`, an arbitrary `sleep`) to "let the animation finish" or "wait for hydration".
- MUST use a polling / wait-for-condition helper to re-sample state until the expected value is reached when no native assertion covers it.
- SHOULD express a hydration or readiness gate as an assertion on an observable signal the app exposes (an attribute flipping, an element appearing), not as a delay.
- SHOULD raise the runner's configured timeout, with justification, rather than sprinkle per-test ad-hoc waits, when a legitimate operation is genuinely slow.

**Example — a hydration gate and a polled computed style, both sleep-free:**

```ts
// Gate on an observable signal the app flips once ready, not on a delay.
await expect(grid).toHaveAttribute("data-virtualized", "true");

// Re-sample a value no native assertion covers, until it settles.
await expect
  .poll(() =>
    statusCode.evaluate((el) => getComputedStyle(el, "::before").animationName),
  )
  .toBe("none");
```

## Setup and Cleanup Hooks

Case-independent setup and cleanup belong in hooks so every test starts from the same state and test bodies show only the behavior under test.

**Guidelines:**

- SHOULD use a before-each hook for setup that does not depend on the specific test case, such as navigating to the route under test.
- SHOULD use an after-each hook for cleanup that does not depend on the specific test case.
- SHOULD start each test from a clean state unless the behavior under test is specifically about persisted state.

**Example:**

```ts
import { test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});
```
