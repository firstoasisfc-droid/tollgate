# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Plain HTML/CSS/vanilla JS front end, zero-dependency Node for local dev, Vercel serverless functions for the hosted demo (user chose Vercel deploy). No framework.

## Users
Developers building LLM agents (assistants that read email, documents, web pages and tool output, and may run code). They are evaluating whether to put a screening layer in front of their agent, usually while prototyping. Secondary audience: Clocked Build Challenge judges (Rezolve.ai), who score practical usefulness, depth of Clocked integration, breadth across Protect/Guard/Inspect, and reproducibility.

## Product Purpose
Tollgate screens every untrusted input at an agent's boundary before it reaches the model or the shell: Protect (`/pii`) removes personal data from outbound prompts, Guard (`/injection`) scores retrieved content for prompt injection, Inspect (`/script`) vets code the agent proposes to run. Each check returns a policy decision (allow, redact, block, hold for approval) with probability and evidence span. Success: a developer understands in one minute what would have slipped through, and copies the middleware into their own agent.

## Positioning
One gate per untrusted channel of an agent (user text, retrieved content, tool/code), with the decision explained by Clocked's probability and exact evidence, not a black-box yes/no. Policy thresholds are explicit and editable.

## Operating Context
Used at a desk during prototyping and in a 60–90 second demo video. Inputs are pasted text, sample emails/documents, and scripts. Runs against the live Clocked API with the user's key held server-side.

## Capabilities and Constraints
- Clocked API base `https://clocked.rezolve.ai/clocked`, `Authorization: Bearer`, POST JSON, max 4 concurrent requests.
- Budget: 20,000 Clocked credits total; per-call cost not published. Avoid wasteful batch runs.
- Never expose or commit the API key; repository must be public.
- Clocked detectors are not enforcement boundaries; the app applies its own policy on the verdict.
- Challenge deadline: 2026-11-10 23:59 ET.

## Brand Commitments
Name: Tollgate (chosen 2026-11-06). Must credit Clocked by name as the engine. Visual language sits alongside Clocked's own interface (warm paper ground, ink, lime evidence marker with ink outline, mono uppercase labels) because the judges are Rezolve.ai leaders who work in that interface daily (user direction 2026-11-06). Do not copy the Clocked logo, wordmark, or present Tollgate as a Clocked product.

## Evidence on Hand
Live results recorded 2026-11-06 with the user's key: Guard injection 0.996 critical "instruction override"; Inspect malicious 0.995 critical "data exfiltration"; Protect found and masked 4–5 PII entities. No users, testimonials or benchmarks exist; do not fabricate any.

## Product Principles
1. Show the decision, then the evidence: every verdict names the exact span that caused it.
2. Policy is visible and editable, never hidden in code.
3. Fail closed: if Clocked is unreachable, the gate holds the input rather than passing it.
4. Copyable: everything shown in the console maps to code a developer can paste.
