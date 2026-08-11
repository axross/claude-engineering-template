# Fixtures, Fakes, And AHA

AHA testing means "avoid hasty abstraction." Do not extract a setup helper just because two tests share a few lines. Extract when the helper makes the scenario easier to read by hiding incidental framework shape while preserving the meaningful input, action, and expected result.

**Good Local Helper:**

```ts
function createDeleteRepositoryWithData(data: Record["data"]): {
  repository: Repository;
  wasUpdateCalled: () => boolean;
} {
  let updateCalled = false;
  const repository = {
    find: async () => ({ items: [{ id: 1, slug: "hello", data }] }),
    update: async () => {
      updateCalled = true;
      return {};
    },
  } as unknown as Repository;

  return { repository, wasUpdateCalled: () => updateCalled };
}
```

**Avoid Opaque Helper:**

```ts
const { repository } = setup({ mode: "bad-index-case-2" });
```

**Guidelines:**

- MUST build fixtures that satisfy the real schema or parser used by the unit under test.
- SHOULD keep fixture factories local to the spec file until at least two spec files need the same factory or the helper names a real shared test boundary.
- SHOULD create setup helpers when they reveal meaningful inputs, outputs, or side effects better than repeated inline setup.
- MUST NOT hide the condition under test behind generic helper options, nested conditionals, magic modes, or opaque fixture factories.
- SHOULD inline setup when the repeated code is short and the differences between scenarios are more important than the duplication.
- SHOULD name magic values with local constants when the value itself explains the condition, such as `fractionalIndex`, `invalidRelation`, or `missingSlug`.

## Framework And Boundary Fakes

Large framework- or library-owned objects (request contexts, ORM clients, SDK handles, data-layer clients) are wide boundaries. Unit tests should fake the smallest part of the boundary the unit actually calls.

**Good:**

```ts
interface FindOptions {
  collection: string;
  includeArchived?: boolean;
  locale?: "en-US" | "ja-JP";
  where?: {
    slug?: {
      equals?: string;
    };
  };
}

const repository = {
  find: async (options: FindOptions) => {
    expect(options.collection).toBe("records");
    return { items: [{ id: 1, slug: "hello-world" }] };
  },
} as unknown as Repository;
```

**Guidelines:**

- MUST type fake boundary options with small local interfaces rather than broad `any`.
- SHOULD use `as unknown as ExternalType` only at the final boundary when mocking framework objects that are too large to construct fully.
- SHOULD assert fake boundary options when those options are part of the unit's public behavior.
- MUST keep tests independent: each scenario creates its own mutable data, fakes, and captured side effects unless a shared immutable constant is sufficient.
- SHOULD avoid setup hooks for mutable fake state because they make each scenario's starting state less visible.

## Mocks And Spies

Mocks are useful for expensive, external, nondeterministic, or framework-owned boundaries. They are not a shortcut for changing the unit's internal path.

**Guidelines:**

- SHOULD use manual fakes for large boundary objects, filesystem/network boundaries, clocks, and loggers.
- SHOULD NOT mock neighboring pure helpers unless the test specifically covers how the unit handles that dependency's failure.
- MUST keep module-mock declarations visible near the imports they affect.
- MUST import the mocking API explicitly when the runner requires or supports it before using its mock, spy, or typed-mock helpers.
- SHOULD prefer typed mocks when a mock has non-trivial arguments or return values.
- SHOULD restore spies and replaced globals in a teardown hook.
