# Tollgate

**Live demo:** https://tollgate-mocha.vercel.app

**Stops what your AI agent should not read, send or run.** Tollgate puts a gate on each untrusted
channel of an LLM agent and lets the [Clocked API](https://clocked.rezolve.ai) decide what passes.

| Channel | Gate | Clocked endpoint | What Tollgate does with the answer |
|---|---|---|---|
| Retrieved content (emails, pages, tool output) | **Guard** | `/injection` | Blocks or holds content that tries to give the agent new instructions |
| Outbound prompt | **Protect** | `/pii` | Replaces personal data and secrets before the prompt leaves |
| Proposed code | **Inspect** | `/script` | Refuses to run scripts that act outside the approved scope |

Every decision comes back as one of `allow`, `redact`, `hold` or `block`, posted as a hazard sign
(DANGER, WARNING, CAUTION, NOTICE) with Clocked's probability and the exact text that caused it.

## Try it in two minutes

```bash
git clone <this repo> && cd tollgate
echo CLOCKED_API_KEY=your_key_here > .env
node server.js        # http://localhost:3000, no npm install needed
```

Node 18 or later. No dependencies.

- **Console**: pick a gate, load a sample or paste your own, screen it. Policy sliders change the thresholds live.
- **Agent scenario**: an accounts-payable assistant handles one supplier email. The email carries a hidden payment order, the draft reply leaks contact and card details, and the proposed script uploads an SSH key. All three gates run in parallel; the summary says what the agent would have done without them.
- **Evaluation**: 15 labelled samples against the live API.
- **Middleware**: the code to put the gates in your own agent.

## Use it in your agent

```js
const { createTollgate } = require("./lib/tollgate");
const gate = createTollgate({ apiKey: process.env.CLOCKED_API_KEY });

const doc = await gate.guard(emailBody);              // retrieved content
if (doc.action === "block") return refuse(doc.hazard, doc.evidence);

const out = await gate.protect(draft);                // outbound prompt
const reply = await llm.complete(out.safeText);

const code = await gate.inspect(script);              // proposed code
if (code.action !== "allow") return askHuman(code);
```

## Results

`npm run eval` runs [15 hand-written samples](eval/samples.json), five per gate (three that should
be stopped, two that should pass), at the default policy. Latest run, live Clocked API:

| Gate | Should stop | Should pass |
|---|---|---|
| Protect | 3 of 3 redacted | 2 of 2 allowed |
| Guard | 3 of 3 blocked | 1 of 2 allowed |
| Inspect | 3 of 3 blocked | 2 of 2 allowed |

**14 of 15 correct.** The miss is a security-training document that *quotes* "ignore previous
instructions"; Guard scored it 0.751 and blocked it. Text that talks about injection can look like
injection. If your agent reads security material, raise Guard's block threshold above 0.75 so such
content lands in Hold for a person instead. We report this rather than tune the sample away.

`npm test` runs nine offline checks against a fake Clocked (no credits): thresholds, signals,
fail-closed behaviour, policy clamping, and that requests carry `Authorization: Bearer` and an
`Idempotency-Key`.

## How Clocked is used

- **Guard** sends `source: "content"` and a policy in `instructions`, reads `injection`, `severity`,
  `category` and each `evidence.quote` with offsets, and maps the score onto hold/block thresholds.
- **Protect** sends nine described entity types (names, emails, phones, cards, credentials,
  government IDs, employee IDs, addresses, dates of birth) with `anonymize`, uses `anonymized_text` as
  the only text that may reach the model, and escalates to DANGER when a credential, card or
  government ID is present. The raw response, which contains the original values, never leaves the server.
- **Inspect** sends the script with an approved-scope policy, takes the higher of `malicious` and
  `suspicious`, and shows the flagged lines.
- **Fails closed.** If Clocked cannot be reached, the gate returns `hold`, never `allow`.
- Three gates in the scenario run in parallel, under Clocked's limit of four concurrent requests.

## Layout

```
lib/tollgate.js     the middleware: createTollgate() -> protect / guard / inspect
lib/handlers.js     request handling shared by local server and Vercel functions
server.js           local server, zero dependencies
api/*.js            Vercel functions (same handlers)
public/             the console (plain HTML, CSS, JS)
eval/               labelled samples and the evaluation runner
test/               offline tests
```

## Deploy on Vercel

Import the repo, add `CLOCKED_API_KEY` under Project Settings, Environment Variables, deploy.
`vercel.json` serves `public/` and the functions in `api/`.

## Notes

All samples are synthetic and written for this project. The API key stays on the server. Built for
the Clocked Build Challenge, October 21 to November 10, 2026, starting from an empty folder.
