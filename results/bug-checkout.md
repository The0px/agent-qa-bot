# QA run 2026-11-19T19:18:53.349Z

**6/7 scenarios passed** · 37 actions · p50 10 ms · p95 108 ms · seeded bug: `checkout`

| Scenario | Result | Time | Failure | Repro |
|---|---|---|---|---|
| Signup rejects an invalid email | pass | 1613 ms |  |  |
| Signup succeeds on the Pro plan | pass | 73 ms |  |  |
| Login with wrong password shows an error | pass | 170 ms |  |  |
| Login sets a session and reaches the account page | pass | 160 ms |  |  |
| Checkout total respects quantities | **fail** | 174 ms | total is $67.50: expected "$67.50", got "$42.50" | [video](videos/checkout-total-respects-quantities.webm) |
| Confirm dialog guards a destructive action | pass | 73 ms |  |  |
| Form inside an iframe | pass | 56 ms |  |  |
