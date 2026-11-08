# Project Status

> Single source of truth for Rewind's current implementation state.
> Last updated: 2026-11-08.
>
> When code and docs disagree, the code is the truth (see `AGENTS.md` → Sources of Truth).
> Update this file whenever a phase completes or an endpoint/feature lands.

## Current Phase

- **Phase 0 — Repository Foundation:** DONE
- **Phase 1 — Vertical Slice (capture & upload):** DONE (in review)
- **Phase 2 — OCR Integration:** NEXT — tasks TASK-0003 (backend) and TASK-0004 (mobile) are **Ready**; implementation not started.

## Implemented Backend Endpoints

| Method | Path | Status |
|---|---|---|
| GET | `/api/v1/health` | IMPLEMENTED |
| POST | `/api/v1/media` | IMPLEMENTED (single upload) |
| POST | `/api/v1/media/batch` | IMPLEMENTED (batch upload) |
| GET | `/api/v1/media` | IMPLEMENTED (list) |

All other endpoints in `docs/api/openapi.yaml` are PLANNED.

## Processing Status (`media.processing_status`)

One enum, synced across three places:
- Java: `apps/backend/src/main/java/com/rewind/app/media/domain/ProcessingStatus.java`
- OpenAPI: `docs/api/openapi.yaml` → `MediaResponse.processingStatus`
- Mobile: `apps/mobile/src/features/camera/types.ts`

| Value | Availability | Notes |
|---|---|---|
| `UPLOADED` | Implemented | default on upload |
| `PROCESSING` | Implemented (reserved) | not yet set by code |
| `OCR_COMPLETED` | Phase 2 | set when OCR text is persisted |
| `COMPLETED` | Implemented (reserved) | terminal state |
| `FAILED` | Implemented (reserved) | error state |

`PENDING` and `ANALYSIS_COMPLETED` (from `AI_PIPELINE.md`) remain PROPOSED for Phases 3+.

UI display (label + color) is centralized in `apps/mobile/src/features/camera/status.ts` (`STATUS_META`).

## Database Migrations (Flyway)

| Version | File | Status |
|---|---|---|
| V1 | `V1__create_users_and_media.sql` | APPLIED |
| V2 | `V2__add_title_and_naming_to_media.sql` | APPLIED |
| V3 | `V3__create_ocr_results.sql` | PLANNED (Phase 2) |

Migrations are immutable once applied. Note: the test profile runs with Flyway disabled (H2, `ddl-auto: create-drop`), so migration SQL is not exercised by the test suite.

## Key Decisions (ADRs)

- [ADR-0001](../decisions/ADR-0001-monorepo.md) — single monorepo without a monorepo framework.
- [ADR-0002](../decisions/ADR-0002-ocr-execution-model-and-processing-states.md) — on-device OCR (ML Kit) primary, backend fallback deferred to Phase 3; adds `OCR_COMPLETED` to `ProcessingStatus`.

## Deferred / Known Gaps

- **Auth is a dev stub:** the backend accepts an optional `X-User-Id` header and falls back to a seeded dev user (`DEFAULT_DEV_USER_ID = 00000000-0000-0000-0000-000000000001`). Real auth (JWT vs session) is open decision #2 in `TECHNICAL_IMPLEMENTATION.md`.
- **Mobile API base URL:** centralized in `apps/mobile/src/api/client.ts` from `EXPO_PUBLIC_API_URL`; see `apps/mobile/.env.example`. The full `apiClient` wrapper (interceptors, auth token injection) is still planned.
- **Flyway not exercised in tests:** consider Testcontainers PostgreSQL when adding that dependency is approved.
- **Mobile state management:** undecided (see `MOBILE_ARCHITECTURE.md`).
