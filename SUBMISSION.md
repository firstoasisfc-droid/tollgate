# Submission pack: Clocked Build Challenge

Entering: **Best Use of Protect, Guard, or Inspect** (all three endpoints, each one gating a different channel).
Deadline: November 10, 2026, 11:59 p.m. ET.

## Form answers (paste as written)

**Project name**
Tollgate

**One line**
Tollgate stops what your AI agent should not read, send or run: Guard screens retrieved content for prompt injection, Protect strips personal data from outbound prompts, and Inspect vets code before the agent runs it.

**Description**
LLM agents take in untrusted text from three places: content they retrieve (emails, web pages, tool output), prompts they send to a model, and code they decide to run. Tollgate puts one gate on each channel. Each gate calls a Clocked endpoint, applies an explicit, editable policy to the answer (allow, redact, hold for a person, or block), and posts the decision as a hazard sign with Clocked's probability and the exact text that caused it.

The console has four views. Console: screen any input through one gate and tune the thresholds live. Agent scenario: an accounts-payable assistant handles one supplier email; the email hides a payment order, the draft reply leaks contact and card details, and the proposed script uploads an SSH key, and all three gates run in parallel. Evaluation: 15 labelled samples against the live API, 14 correct, with the one miss explained. Middleware: the code to drop the gates into your own agent.

**How Clocked is used**
- Guard (`/injection`) with `source: "content"` and a policy in `instructions`. We map `injection` onto hold and block thresholds, and show `severity`, `category` and every `evidence` quote highlighted at its offsets in the input.
- Protect (`/pii`) with nine described entity types and `anonymize`. Only `anonymized_text` may reach the model. A credential, card or government ID escalates the sign to DANGER. The raw response, which holds the original values, never leaves our server.
- Inspect (`/script`) with an approved-scope policy. We take the higher of `malicious` and `suspicious` and show the flagged lines.
- Each endpoint's output decides what the agent may do next, so all three are used meaningfully, not displayed.
- The gates fail closed: if Clocked cannot be reached, the input is held, never passed.
- Requests carry `Authorization: Bearer` and a unique `Idempotency-Key`; the scenario runs three calls in parallel, under the four-request limit.

**Known weakness (stated up front)**
Guard blocked a security-training document that quotes "ignore previous instructions" (score 0.751). Text about injection can look like injection. Raising Guard's block threshold above 0.75 sends such content to Hold for a person instead. The Evaluation view and README report this.

**Reproducibility**
`node server.js` runs it with no install. `npm test` runs nine offline checks with no credits. `npm run eval` reruns the 15-sample evaluation. README covers setup, Vercel deploy and the middleware API.

**Repository**: https://github.com/firstoasisfc-droid/tollgate
**Demo video**: <URL>
**Live demo**: https://tollgate-mocha.vercel.app
**Team**: <your name>, solo

## Demo video script (about 75 seconds)

Record at 1440x900. Start on the Console with the Guard gate selected.

1. (0:00) "Tollgate stops what your AI agent should not read, send or run. Three Clocked endpoints, one gate per channel."
2. (0:08) Guard: click **Screen input** on the supplier email. "Hidden in the email is an order to wire money without a second approver. Clocked scores it 0.997, critical. The gate blocks it, and the exact sentences are highlighted."
3. (0:22) Drag Guard's **Block at** slider to 1.00 and screen again. "Policy is explicit: the same score now lands in Hold for a person." Reset policy.
4. (0:32) Protect: screen the draft reply. "Five personal values found. The card number makes this DANGER. Only the redacted text goes to the model." Point at **Safe to send**.
5. (0:44) Inspect: screen the script. "It reads an SSH key and uploads it. Blocked before it runs."
6. (0:52) **Agent scenario**, **Run all three gates**. "One task, three channels, in parallel. Three of three stopped, and here is what the agent would have done without them."
7. (1:04) **Evaluation**. "Fifteen labelled samples, fourteen correct, and we show the miss and how to handle it."
8. (1:12) **Middleware**. "And it is one file you can drop into your own agent."

## Before submitting

- [ ] Push the repo public (`.env` is in `.gitignore`; check it is not committed).
- [x] Deploy on Vercel, add `CLOCKED_API_KEY` in Project Settings, open the live URL once.
- [ ] Record the video from the script above.
- [ ] Paste the three URLs into the form fields above.
