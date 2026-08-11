# Assertions, Snapshots, And Side Effects

Assertions should make the reason for failure obvious. A test with a precise assertion teaches future maintainers what behavior matters; a broad assertion often turns the test into a change detector with no explanation.

**Good:**

```ts
expect(decode(TagResponse, response)).toEqual({
  totalItems: 1,
  limit: undefined,
  page: undefined,
  totalPages: undefined,
  items: [{ id: 1, slug: "typescript", name: "TypeScript" }],
});
```

**Avoid:**

```ts
expect(decode(TagResponse, response)).toMatchSnapshot();
```

**Guidelines:**

- SHOULD prefer explicit object assertions over snapshots for structured return values that maintainers must understand and maintain.
- SHOULD assert only behavior relevant to the scenario, but include enough fields to catch the likely regression.
- SHOULD use a partial-match assertion when partial object behavior is the contract and extra fields are intentionally irrelevant.
- MUST NOT assert every incidental field merely because it exists in the returned object.
- SHOULD assert stable error contracts, not every word of a third-party formatter unless the exact text is part of this project's API.

## Distinguishing Observable Output

Reaching a branch is necessary but not sufficient. An assertion that only checks something renders or exists proves reachability, not behavior — it keeps passing even after the branch itself is deleted.

**Guidelines:**

- MUST assert the branch's **distinguishing observable output**, not merely that something renders or exists — a test that exercises a conditional state but only makes an element-merely-renders assertion would still pass if the branch were deleted.
- MUST assert the difference the branch produces: the toggled attribute or state, the changed text, the emitted call.
- SHOULD add a negative case proving the distinguishing output is absent when the branch is not taken, where practical.

## Snapshot Discipline

Snapshots are useful when the serialized output is small, deterministic, and easier to review than a hand-written assertion. They are risky when they are large, unstable, or accepted without understanding the behavior change.

**Useful Snapshot Situation:**

```ts
expect(parsedTree).toMatchInlineSnapshot(`
	{
	  "type": "node",
	  "children": [
	    {
	      "type": "text",
	      "value": "Hello",
	    },
	  ],
	}
`);
```

**Bad Snapshot Situation:**

```ts
expect(fullRecordWithDatesAndRelations).toMatchSnapshot();
```

**Guidelines:**

- MUST NOT use snapshots to avoid deciding which fields or state changes matter.
- MUST keep snapshots small, deterministic, and focused on the behavior under test when snapshots are justified.
- SHOULD prefer inline snapshots or focused diff snapshots over large external snapshots when the snapshot itself is the clearest assertion.
- MUST review snapshot changes as behavior changes, not as automatic test maintenance.
- MUST NOT commit snapshots that include unstable IDs, dates, ordering, framework noise, or irrelevant private fields unless those values are normalized first.

## Async, Errors, And Side Effects

Async tests should fail deterministically when a promise rejects, resolves incorrectly, or skips a side effect. Error tests should prove the caller receives the intended failure contract.

**Examples:**

```ts
await expect(validateReferences(repository, data)).rejects.toThrow(
  /relation='media'/,
);
```

```ts
await expect(loadValue()).resolves.toEqual({ ok: true });
```

```ts
expect(wasUpdateCalled()).toBe(false);
```

**Guidelines:**

- MUST `await` async work, including resolves/rejects assertions.
- MUST NOT use unobserved promises or floating async callbacks in tests.
- SHOULD use a rejects-to-throw assertion for expected failures from async functions.
- SHOULD verify mutation safety when a helper clones or transforms caller-owned objects.
- SHOULD silence or fake logs in unit tests when logs are incidental to the behavior under test.
- MUST assert observable side effects when the side effect is the behavior, such as a mocked `update` receiving a preserved status value or not being called after invalid input.
