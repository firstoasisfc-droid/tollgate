# Tollgate design system

Mode: Operate (security console). Look: ANSI Z535 safety signs set on Clocked's own material, so judges see a familiar surface. Never copy the Clocked logo or wordmark.

## Tokens (`public/app.css` :root)
| Token | Value | Use |
|---|---|---|
| `--ground` | #f2efe6 | page |
| `--paper` | #fbfaf6 | panels, inputs |
| `--ink` | #20221f | text, borders, focus ring, primary button |
| `--rule` | #d8d8ce | dividers |
| `--muted` | #5e615a | secondary text |
| `--wash` | #e9e6db | notes, hover |
| `--mark` | #d3f56a | evidence highlight (1px ink inset) |
| `--danger` | #c8102e | DANGER sign only |
| `--warning` | #f07120 | WARNING sign only |
| `--caution` | #ffd100 | CAUTION sign only |
| `--notice` | #0060a8 | NOTICE sign only (italic, no symbol) |

Signal colours live only inside signs and lit log rows. Everything else is ink on paper.

## Type
Archivo (variable width/weight) for UI and sign words. JetBrains Mono, uppercase, for labels, view titles, scores and evidence offsets.

## Components
- **Sign**: band (signal word + symbol), hazard line, "If passed", gate action, score track with hold/block ticks, evidence quotes (click to jump to the mark in the input), footer meta. Posts in with a clip animation; static under reduced motion.
- **Audit log**: one row per decision, lit and tinted per signal while held or blocked, with an Acknowledge button.
- **Policy rail**: square ink thumbs on a 1px ink track. A change re-decides the last result client-side and says so; Clocked is not called again.
- **Inline message**: user slips (empty input) are plain text, never a hazard sign.

## Decision → signal
block + critical/high → DANGER · block otherwise → WARNING · hold → CAUTION · allow → NOTICE · Clocked unreachable → hold/CAUTION (fail closed).
