// Offline tests: a fake fetch stands in for Clocked, so these spend no credits.
// Run: node --test test/
const test = require("node:test");
const assert = require("node:assert");
const { createTollgate, mergePolicy } = require("../lib/tollgate");

function fakeFetch(map) {
  return async (url, init) => {
    const path = new URL(url).pathname.replace("/clocked", "");
    const body = JSON.parse(init.body);
    assert.match(init.headers.Authorization, /^Bearer test-key$/);
    assert.ok(init.headers["Idempotency-Key"], "sends an idempotency key");
    const out = typeof map[path] === "function" ? map[path](body) : map[path];
    if (out instanceof Error) throw out;
    return { ok: true, status: 200, text: async () => JSON.stringify(out), statusText: "OK" };
  };
}

test("guard blocks above the block threshold, with DANGER for critical", async () => {
  const tg = createTollgate({ apiKey: "test-key", fetchImpl: fakeFetch({ "/injection": { injection: 0.996, severity: "critical", category: "instruction override", evidence: [{ quote: "Ignore the rule", start: 5, end: 20, confidence: 1 }] } }) });
  const r = await tg.guard("x");
  assert.equal(r.action, "block");
  assert.equal(r.signal, "DANGER");
  assert.equal(r.evidence[0].quote, "Ignore the rule");
});

test("guard holds between hold and block thresholds", async () => {
  const tg = createTollgate({ apiKey: "test-key", fetchImpl: fakeFetch({ "/injection": { injection: 0.4, severity: "low", category: "social engineering" } }) });
  const r = await tg.guard("x");
  assert.equal(r.action, "hold");
  assert.equal(r.signal, "CAUTION");
});

test("guard allows below hold threshold and posts NOTICE", async () => {
  const tg = createTollgate({ apiKey: "test-key", fetchImpl: fakeFetch({ "/injection": { injection: 0.01, severity: "none", category: "benign" } }) });
  const r = await tg.guard("x");
  assert.equal(r.action, "allow");
  assert.equal(r.signal, "NOTICE");
});

test("policy from the caller changes the decision", async () => {
  const tg = createTollgate({ apiKey: "test-key", policy: { guard: { block: 0.95, hold: 0.9 } }, fetchImpl: fakeFetch({ "/injection": { injection: 0.6, severity: "medium" } }) });
  const r = await tg.guard("x");
  assert.equal(r.action, "allow");
});

test("inspect uses the higher of malicious and suspicious", async () => {
  const tg = createTollgate({ apiKey: "test-key", fetchImpl: fakeFetch({ "/script": { malicious: 0.1, suspicious: 0.7, severity: "medium", category: "persistence" } }) });
  const r = await tg.inspect("x");
  assert.equal(r.score, 0.7);
  assert.equal(r.action, "block");
});

test("protect redacts and escalates to DANGER when a secret is present", async () => {
  const tg = createTollgate({ apiKey: "test-key", fetchImpl: fakeFetch({ "/pii": (b) => {
    assert.equal(b.anonymize, "replace");
    return { entities: [{ type: "secret", value: "AKIA123", start: 0, end: 7, confidence: 1 }], counts: { secret: 1 }, anonymized_text: "<SECRET>" };
  } }) });
  const r = await tg.protect("AKIA123");
  assert.equal(r.action, "redact");
  assert.equal(r.signal, "DANGER");
  assert.equal(r.safeText, "<SECRET>");
});

test("fails closed when Clocked is unreachable", async () => {
  const tg = createTollgate({ apiKey: "test-key", fetchImpl: fakeFetch({ "/script": new Error("network down") }) });
  const r = await tg.inspect("rm -rf /");
  assert.equal(r.action, "hold");
  assert.match(r.error, /network down/);
});

test("mergePolicy clamps values and keeps hold at or below block", () => {
  const p = mergePolicy({ guard: { block: 0.4, hold: 0.9 }, inspect: { block: 7 }, protect: { mode: "nope" } });
  assert.equal(p.guard.hold, 0.4);
  assert.equal(p.inspect.block, 1);
  assert.equal(p.protect.mode, "replace");
});

test("refuses to start without an API key", () => {
  assert.throws(() => createTollgate({}), /API key/);
});
