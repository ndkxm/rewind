# Rewind Task Management

Tasks define actionable work items for contributors and AI coding agents.

## Task Workflow

```
Proposed ──> Ready ──> In Progress ──> Review ──> Done
```

1. **Proposed**: Idea or work item drafted using [`TASK_TEMPLATE.md`](TASK_TEMPLATE.md).
2. **Ready**: Requirements, acceptance criteria, and relevant files are clearly specified.
3. **In Progress**: Actively being implemented by a developer or AI agent.
4. **Review**: Code, tests, and documentation updates are completed and pending review.
5. **Done**: Merged and verified against all acceptance criteria.

## Task Organization

Place task files in the corresponding directory:
- `docs/tasks/mobile/`: Mobile UI, features, Expo configuration.
- `docs/tasks/backend/`: Spring Boot endpoints, database, AI adapters.
- `docs/tasks/integration/`: End-to-end integration, release preparation, infrastructure.
