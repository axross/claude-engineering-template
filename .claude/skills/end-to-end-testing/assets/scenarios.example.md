# Scenario Catalog (example)

This is an example journey catalog for the scenario-coverage discipline. Copy it into
the project's e2e directory (for example `e2e/scenarios.md`) and edit it to list the
project's real journeys. It is the coverage **denominator**: one row per user or client
journey, joined to tests by the stable dotted `Id`.

The project's coverage gate reads the table below. Parse the columns `Id`, `Title`,
`Area`, and `Priority` (case-insensitive header, any order) and ignore the rest, so
other columns can be added freely. Priority is `must` | `should` | `may`. Keep
genuinely-untested journeys here with an honest priority so the report shows real gaps.

| Id                       | Title                                      | Area     | Priority |
| ------------------------ | ------------------------------------------ | -------- | -------- |
| cards.browse             | Visitor browses and filters the card list  | cards    | must     |
| cards.detail             | Visitor opens a card and reads its detail  | cards    | must     |
| checkout.payment.ok      | Buyer completes checkout and pays          | checkout | must     |
| checkout.payment.decline | Declined card shows a recoverable error    | checkout | should   |
| account.signout          | Signed-in user signs out                   | account  | may      |
| fetch.remote.import      | Importing from a live third-party endpoint | fetch    | may      |
