# Spec Structure And Naming

The test runner output should read like a behavior report. The full test name is the concatenation of `describe(...)` and the test-case name, so use the outer subject for the exported contract and the scenario name for condition plus expected behavior.

**Good:**

```ts
describe("deleteRecordTool()", () => {
  describe("when delete index is invalid", () => {
    it("rejects negative indexes without updating the record", async () => {
      // arrange
      // act
      // assert
    });

    it("rejects out-of-range indexes without updating the record", async () => {
      // arrange
      // act
      // assert
    });
  });
});
```

**Avoid:**

```ts
describe("deleteRecordTool", () => {
  test("deleteRecordTool handles bad input", async () => {
    // vague condition, repeated subject, no callable suffix, and an
    // inconsistent test-case function
  });
});
```

(`it`/`test` above stand in for the project's chosen test-case function; pick one and use it consistently.)

**Guidelines:**

- MUST import the test framework's APIs explicitly when the runner requires or supports it; this includes setup/teardown hooks, the assertion entrypoint, the test-case function, and the mocking API used in the file.
- MUST use the project's chosen test-case function consistently and not mix it with an alternative spelling.
- MUST group scenarios with `describe(...)` by the exported function, method, handler object, schema, codec, object contract, or type contract under test.
- MUST suffix function, method, or callable handler names in `describe(...)` or test-case titles with `()`, such as `describe("formatTags()")`, `describe("deleteRecordTool()")`, or `it("calls sanitize()")`.
- MUST NOT suffix non-callable subjects with `()`: schemas, codecs, object contracts, and type names stay bare, such as `describe("RecordResponse")`, and UI-component subjects take angle brackets instead, such as `describe("<RecordHeader>")`, when the project's unit suite renders components.
- MUST write test-case names as sentence-like behavior statements that describe what the scenario verifies or ensures.
- SHOULD NOT repeat the outer `describe(...)` subject in every child test-case name.
- MUST name condition-specific scenarios with the relevant condition, such as `when input is a paginated response`, `when index is invalid`, or `when an optional flag is enabled`.
- MUST group multiple scenarios that share the same condition or situation under a nested `describe("when ...")` block.
- SHOULD split one broad test case into multiple scenarios when it verifies different conditions, such as `null` vs primitive input, negative vs out-of-range indexes, or paginated vs single-record input.

## Adapting Method State Expected Naming

Some unit-testing guidance recommends names shaped like `method_state_expected`. In this convention, that maps to nested test names instead of one long string.

| Generic idea | Project shape                                                                     |
| ------------ | --------------------------------------------------------------------------------- |
| method       | outer `describe("methodName()")`                                                  |
| state        | nested `describe("when ...")` or a `when ...` clause in the test-case name        |
| expected     | child test case (`"returns..."`, `"throws..."`, `"preserves..."`, `"rejects..."`) |

**Examples:**

```ts
describe("getErrorMessage()", () => {
  it("returns the message when the thrown value is an Error instance", () => {
    expect(getErrorMessage(new Error("Failed"))).toBe("Failed");
  });
});
```

```ts
describe("RecordParameters", () => {
  describe("when index is invalid", () => {
    it("rejects fractional index values", () => {
      expect(() => RecordParameters.parse({ id: "abc", index: [1.5] })).toThrow(
        SchemaError,
      );
    });
  });
});
```

**Guidelines:**

- SHOULD use the full test-runner output name to preserve method, condition, and expected behavior without repeating the method name in every test case.
- SHOULD use shallow condition grouping; avoid deeply nested `describe(...)` blocks that make setup hard to track.
- SHOULD avoid setup hooks for mutable setup unless repeated setup is truly incidental and the scenario-specific inputs remain obvious.
