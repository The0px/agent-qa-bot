# QA run 2026-11-19T18:41:57.724Z

**6/7 scenarios passed** · 37 actions · p50 9 ms · p95 107 ms · seeded bug: `checkout`

| Scenario | Result | Time | Failure |
|---|---|---|---|
| Signup rejects an invalid email | pass | 1458 ms |  |
| Signup succeeds on the Pro plan | pass | 49 ms |  |
| Login with wrong password shows an error | pass | 151 ms |  |
| Login sets a session and reaches the account page | pass | 159 ms |  |
| Checkout total respects quantities | **fail** | 160 ms | total is $67.50: expected "$67.50", got "$42.50" |
| Confirm dialog guards a destructive action | pass | 53 ms |  |
| Form inside an iframe | pass | 61 ms |  |
