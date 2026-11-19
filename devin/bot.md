# Devin Bot playbook: QA on autopilot

## Triggers

| Source | Event | Scope |
|---|---|---|
| GitHub | PR opened or updated | Journeys that touch the changed routes, then the full suite before merge |
| Deploy hook | Preview or production deploy finished | Full suite against the deploy URL (`--base`) |
| Sentry | New issue or regression spike | Replay the journey closest to the failing route, then try to reproduce the stack trace |
| Slack | `@devin qa <url>` | Full suite plus exploratory pass on that URL |

## Steps

1. Check out the repo and start the app, or take the deploy URL.
2. Run `bun bench/run.ts --base <url>`.
3. If everything passes, post a one-line verdict in the PR and in Slack with the p50 latency, then stop.
4. For each failing scenario:
   - Re-run it with `agent-browser record start` to capture a video.
   - Read the diff and find the cause.
   - Open a fix PR that includes a new or tightened scenario.
   - File a Linear ticket with the scenario, the expected and actual values, the video and a link to the fix PR.
5. Post a summary in Slack: what failed, why, and the fix PR link.

## A good bug report

- **Title:** the user-visible symptom, e.g. "Checkout total ignores quantity".
- **Repro:** the scenario name and the exact command to run.
- **Expected vs actual:** copied from the bench output.
- **Evidence:** the video, plus `results/*.json`.
- **Cause and fix:** the file, the line, and the fix PR.

## Guardrails

- Run only against preview deploys or local builds. Hitting production is limited to read-only journeys.
- Test accounts only. Credentials come from the agent-browser auth vault, never from the repo.
- Use `--allowed-domains` so the bot can't wander off the app under test.
