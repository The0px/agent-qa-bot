// Drives the lab like a user through the agent-browser CLI, times every action and checks the outcome.
// Usage: bun bench/run.ts [--bug checkout] [--base http://host:port]
import { parseArgs } from "node:util";
import { mkdir } from "node:fs/promises";
import { scenarios, type Step } from "./scenarios";

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    bug: { type: "string" },
    base: { type: "string" },
    port: { type: "string", default: "4790" },
    video: { type: "boolean", default: false },
  },
});

if (values.bug) process.env.BUG = values.bug;
process.env.PORT = values.port;
const base = values.base ?? (await import("../lab/server")).server.url.origin;
const session = `qa-bench-${process.pid}`;

type StepResult = { label: string; ms: number; ok: boolean; detail?: string };
type ScenarioResult = { name: string; ok: boolean; ms: number; steps: StepResult[]; video?: string };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Replays a failing journey on camera so the bug report carries a repro anyone can watch.
async function recordRepro(sc: (typeof scenarios)[number]) {
  await mkdir("results/videos", { recursive: true });
  const path = `results/videos/${slug(sc.name)}.webm`;
  const first = sc.steps[0].cmd;
  const url = first[0] === "open" ? first[1].replace("{base}", base) : undefined;
  await ab(["record", "start", path, ...(url ? [url] : [])]);
  // Steps take a few ms; the pauses make the replay watchable by a human.
  await ab(["wait", "800"]);
  for (const step of url ? sc.steps.slice(1) : sc.steps) {
    await runStep(step);
    await ab(["wait", "800"]);
  }
  await ab(["wait", "1500"]);
  await ab(["record", "stop"]);
  return path;
}

async function ab(args: string[]) {
  const proc = Bun.spawn(["agent-browser", "--session", session, ...args], { stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text(), proc.exited]);
  return { code, out: (out + err).trim() };
}

async function runStep(step: Step): Promise<StepResult> {
  const args = step.cmd.map((a) => a.replace("{base}", base));
  const t = performance.now();
  const { code, out } = await ab(args);
  const ms = Math.round(performance.now() - t);
  if (code !== 0) return { label: step.label, ms, ok: false, detail: out.split("\n").at(-1) };
  if (step.expect && !out.includes(step.expect)) return { label: step.label, ms, ok: false, detail: `expected "${step.expect}", got "${out.slice(0, 120)}"` };
  return { label: step.label, ms, ok: true };
}

const results: ScenarioResult[] = [];
for (const sc of scenarios) {
  const steps: StepResult[] = [];
  for (const step of sc.steps) {
    const r = await runStep(step);
    steps.push(r);
    if (!r.ok) break;
  }
  const ok = steps.length === sc.steps.length && steps.every((s) => s.ok);
  const video = !ok && values.video ? await recordRepro(sc) : undefined;
  results.push({ name: sc.name, ok, ms: steps.reduce((a, s) => a + s.ms, 0), steps, video });
  console.log(`${ok ? "PASS" : "FAIL"}  ${sc.name}${ok ? "" : `  -> ${steps.at(-1)?.label}: ${steps.at(-1)?.detail}`}`);
}
await ab(["close"]);

const allSteps = results.flatMap((r) => r.steps);
const sorted = allSteps.map((s) => s.ms).sort((a, b) => a - b);
const summary = {
  date: new Date().toISOString(),
  bug: values.bug ?? null,
  passed: results.filter((r) => r.ok).length,
  total: results.length,
  actions: allSteps.length,
  p50_ms: sorted[Math.floor(sorted.length / 2)] ?? 0,
  p95_ms: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
};

const md = [
  `# QA run ${summary.date}`,
  "",
  `**${summary.passed}/${summary.total} scenarios passed** · ${summary.actions} actions · p50 ${summary.p50_ms} ms · p95 ${summary.p95_ms} ms${summary.bug ? ` · seeded bug: \`${summary.bug}\`` : ""}`,
  "",
  "| Scenario | Result | Time | Failure | Repro |",
  "|---|---|---|---|---|",
  ...results.map((r) => {
    const f = r.steps.find((s) => !s.ok);
    const failure = f ? `${f.label}: ${f.detail?.replaceAll("|", "\\|")}` : "";
    const repro = r.video ? `[video](${r.video.replace("results/", "")})` : "";
    return `| ${r.name} | ${r.ok ? "pass" : "**fail**"} | ${r.ms} ms | ${failure} | ${repro} |`;
  }),
  "",
].join("\n");

await mkdir("results", { recursive: true });
const tag = summary.bug ? `bug-${summary.bug}` : "latest";
await Bun.write(`results/${tag}.json`, JSON.stringify({ summary, results }, null, 2));
await Bun.write(`results/${tag}.md`, md);
console.log(`\n${summary.passed}/${summary.total} passed, p50 ${summary.p50_ms} ms, report in results/${tag}.md`);
process.exit(summary.passed === summary.total ? 0 : 1);
