# Schemas And Type Contracts

Schema modules should be tested with real valid and invalid inputs. Type-only modules should still have compile-time coverage when they define reusable public contracts. The `parse`/`decode` calls below stand in for whatever runtime schema or codec library the project uses.

**Schema Defaults Example:**

```ts
describe("RecordParameters", () => {
  it("applies locale and flag defaults when optional parameters are omitted", () => {
    const params = RecordParameters.parse({
      slug: "hello-world",
      index: [0],
    });

    expect(params.locale).toBe("ja-JP");
    expect(params.includeArchived).toBe(false);
  });
});
```

**Codec Decode Example:**

```ts
describe("RecordResponse", () => {
  it("decodes collection results when input is a paginated response", () => {
    expect(
      decode(RecordResponse, {
        totalItems: 1,
        items: [{ id: 1, slug: "hello", status: "draft" }],
      }),
    ).toMatchObject({
      totalItems: 1,
      items: [{ id: 1, slug: "hello", status: "draft" }],
    });
  });
});
```

**Type Contract Example:**

```ts
const response = {
  content: [{ type: "text", text: "ok" }],
} satisfies TextResponse;

expect(response.content).toEqual([{ type: "text", text: "ok" }]);
```

**Guidelines:**

- MUST test schema defaults, accepted values, rejected values, and decoded output shape for public schemas/codecs.
- SHOULD include at least one collection/list-shaped input when a schema supports both single records and collection responses.
- SHOULD test encode behavior when the codec's encoded output is part of the public contract, such as mapping an external field name back to its stored form.
- SHOULD use a compile-time construct such as `satisfies` in specs for exported type aliases and interfaces that have no runtime representation.
- MUST NOT duplicate the entire schema in the assertion; assert behavior future edits could accidentally break.
- SHOULD prefer real schema parsing or decoding over hand-maintained mock return shapes when the schema is the unit under test.
- SHOULD group schema specs by schema or codec name without `()`, because schemas and codecs are object contracts rather than callable functions in test titles.

## Invalid Input Cases

Invalid input tests should name the rejected condition and should not combine unrelated invalid inputs unless the same condition is being parameterized.

**Good:**

```ts
describe("when index is invalid", () => {
  it("rejects an empty index array", () => {
    expect(() => {
      RecordParameters.parse({ slug: "hello-world", index: [] });
    }).toThrow(SchemaError);
  });

  it("rejects fractional index values", () => {
    expect(() => {
      RecordParameters.parse({ slug: "hello-world", index: [1.5] });
    }).toThrow(SchemaError);
  });
});
```

**Guidelines:**

- MUST name the invalid condition in the test-case title or enclosing `describe("when ...")` block.
- SHOULD split unrelated invalid conditions into separate scenarios.
- MAY use the runner's table-driven case helper for a table of equivalent invalid cases, but MUST keep the table small and the case label readable.
- MUST use the project's chosen test-case function (and its table-driven variant) consistently rather than mixing alternative spellings.
