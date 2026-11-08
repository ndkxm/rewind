# Architecture Decision Records (ADRs)

Architecture Decision Records document significant architectural, technical, and organizational decisions made for Rewind.

## ADR Workflow

1. Copy the template format below to a new file named `ADR-NNNN-<short-title>.md`.
2. Set status to `Proposed` and draft Context, Options, and Decision.
3. Submit for review / consensus.
4. Once agreed, update status to `Accepted` and record the acceptance date.
5. If an existing decision is superseded, update the old ADR's status to `Superseded` and link the new ADR.

## ADR Template Format

```markdown
# ADR-NNNN: <Decision title>
- Status: Proposed | Accepted | Superseded
- Date: YYYY-MM-DD
- Decision owners: <team/author>

## Context
Why is a decision needed? What problem are we solving?

## Options
What alternatives were considered?

## Decision
What was selected and why?

## Consequences
Benefits, trade-offs, and migration implications.

## Follow-up
What needs to be implemented or revisited?
```

## Index of Decisions

| ID | Title | Status | Date |
|---|---|---|---|
| [ADR-0001](ADR-0001-monorepo.md) | Single Monorepo without Monorepo Framework | Accepted | 2026-11-07 |
| [ADR-0002](ADR-0002-ocr-execution-model-and-processing-states.md) | OCR Execution Model and Processing States | Accepted | 2026-11-08 |
