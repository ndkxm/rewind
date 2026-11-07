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

## Task Registry

| Task ID | Title | Target Phase | Status | Assignee / Module |
|---|---|---|---|---|
| [TASK-0001](backend/TASK-0001-media-upload.md) | Backend Media Upload & Supabase Storage | Phase 1 | Review | Backend (`media`, `storage`) |
| [TASK-0002](mobile/TASK-0002-camera-capture-and-preview.md) | Camera Capture and Media Upload UI | Phase 1 | Review | Mobile (`camera`) |
| [TASK-0003](backend/TASK-0003-ocr-entity-and-api.md) | Backend OCR Entity, Migration, and API | Phase 2 | Ready | Backend (`ocr`, `media`) |
| [TASK-0004](mobile/TASK-0004-mobile-ocr-integration.md) | Mobile On-Device OCR Integration & Text Display | Phase 2 | Ready | Mobile (`ocr`, `camera`) |

## Task Organization

Place task files in the corresponding directory:
- `docs/tasks/mobile/`: Mobile UI, features, Expo configuration.
- `docs/tasks/backend/`: Spring Boot endpoints, database, AI adapters.
- `docs/tasks/integration/`: End-to-end integration, release preparation, infrastructure.
