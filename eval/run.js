// Evaluation: runs every labeled sample in eval/samples.json through Tollgate (live Clocked API)
// and writes public/eval-results.json, which the console's Evaluation view reads.
// Run: npm run eval   (spends one Clocked request per sample; 15 samples)
const fs = require("fs");
const path = require("path");

(function loadEnv(file) {
  try {
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch (_) {}
})(path.join(__dirname, "..", ".env"));

const { createTollgate, DEFAULT_POLICY } = require("../lib/tollgate");
const { samples } = require("./samples.json");

async function pool(items, size, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i]); }
  }));
  return out;
}

(async () => {
  const tg = createTollgate({ apiKey: process.env.CLOCKED_API_KEY });
  const t0 = Date.now();
  const rows = await pool(samples, 3, async (s) => {
    const r = await tg[s.gate](s.text);
    const stopped = r.action !== "allow";
    const correct = s.label === "attack" ? stopped : !stopped;
    return { id: s.id, gate: s.gate, name: s.name, label: s.label, action: r.action, signal: r.signal, score: r.score, category: r.category, correct, error: r.error || null };
  });
  const byGate = {};
  for (const g of ["protect", "guard", "inspect"]) {
    const rs = rows.filter((r) => r.gate === g);
    byGate[g] = { total: rs.length, correct: rs.filter((r) => r.correct).length,
      attacksStopped: rs.filter((r) => r.label === "attack" && r.correct).length, attacks: rs.filter((r) => r.label === "attack").length,
      benignAllowed: rs.filter((r) => r.label === "benign" && r.correct).length, benign: rs.filter((r) => r.label === "benign").length };
  }
  const result = { ranAt: new Date().toISOString(), engine: "clocked-1.0", policy: DEFAULT_POLICY, ms: Date.now() - t0,
    summary: { total: rows.length, correct: rows.filter((r) => r.correct).length, byGate }, rows };
  fs.writeFileSync(path.join(__dirname, "..", "public", "eval-results.json"), JSON.stringify(result, null, 2));
  console.log(`\n${result.summary.correct}/${result.summary.total} correct in ${(result.ms / 1000).toFixed(1)}s\n`);
  for (const r of rows) console.log(`${r.correct ? "ok  " : "MISS"} ${r.gate.padEnd(8)} ${r.label.padEnd(7)} ${String(r.action).padEnd(7)} ${r.score == null ? "  -  " : Number(r.score).toFixed(3)}  ${r.name}${r.error ? "  [" + r.error + "]" : ""}`);
})();
