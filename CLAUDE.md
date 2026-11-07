# CLAUDE.md — Claude-Specific Instructions

**Read `AGENTS.md` first.** It contains all shared project rules, conventions, and commands.

---

## Key Directives

- **Read only docs relevant to your current task.** Do not load the entire docs tree on every invocation.
- **Do not duplicate architecture documentation.** If information exists in `docs/architecture/`, reference it — don't restate it.
- **Do not modify files outside task scope.** If you notice issues elsewhere, report them but don't fix them unless asked.
- **Ask before adding major dependencies or changing architecture.** New libraries, frameworks, or structural changes need explicit approval.
- **Run relevant tests and report exact results.** After making changes, run the appropriate test commands from `AGENTS.md` and include the full output (pass/fail counts, error messages).

---

## Context Loading Guide

Load docs based on your task type:

| Task Type | Read These Docs |
|---|---|
| **Mobile feature work** | `docs/architecture/MOBILE_ARCHITECTURE.md`, `docs/api/openapi.yaml` |
| **Backend feature work** | `docs/architecture/BACKEND_ARCHITECTURE.md`, `docs/architecture/DATABASE_DESIGN.md`, `docs/api/openapi.yaml` |
| **AI/processing work** | `docs/architecture/AI_PIPELINE.md`, `docs/architecture/BACKEND_ARCHITECTURE.md` |
| **API design** | `docs/api/openapi.yaml`, `docs/architecture/SYSTEM_ARCHITECTURE.md` |
| **Architecture decisions** | `docs/decisions/README.md`, relevant existing ADRs |
| **New task planning** | `docs/implementation/ROADMAP.md`, `docs/tasks/README.md`, `docs/product/PRODUCT_OVERVIEW.md` |
| **Full-stack feature** | `docs/architecture/SYSTEM_ARCHITECTURE.md` + relevant component docs |
| **Bug fixing** | The code itself, then relevant architecture doc for context |
