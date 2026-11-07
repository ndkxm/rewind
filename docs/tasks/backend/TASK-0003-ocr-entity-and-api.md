# TASK-0003: Backend OCR Entity, Migration, and API

## Status
Ready

## Objective
Implement PostgreSQL Flyway migration for `ocr_results` table, create the domain entity and JPA repository in the backend `ocr` module, and expose REST endpoints to store and retrieve OCR text (`POST /api/v1/media/{id}/ocr` and `GET /api/v1/media/{id}/ocr`).

## Context
Phase 2 requires the Rewind backend to persist raw extracted text, language detection, and confidence scores linked to each uploaded media item. This raw text forms the foundation for AI structured extraction (Phase 3) and full-text keyword search (Phase 4).

## Requirements
- [ ] Create Flyway migration `V2__create_ocr_results.sql` with `ocr_results` table, foreign key constraint to `media(id)`, and indices.
- [ ] Implement `OcrResult` entity in `com.rewind.app.ocr.domain` or `com.rewind.app.media.domain`.
- [ ] Implement `OcrRepository` with Spring Data JPA.
- [ ] Implement `OcrService` handling creation, retrieval, and ownership validation for OCR results.
- [ ] Expose `POST /api/v1/media/{id}/ocr` to accept OCR text payload (rawText, language, confidence, provider).
- [ ] Expose `GET /api/v1/media/{id}/ocr` to return OCR details for a given media ID.
- [ ] Update `Media` processing status to `COMPLETED` or `OCR_PROCESSED` upon successful OCR persistence.
- [ ] Add unit and controller mock MVC tests.
- [ ] Update `docs/api/openapi.yaml` to document the new endpoints.

## Out of scope
- Vision LLM JSON schema extraction (deferred to Phase 3).
- Vector embeddings and semantic search (deferred to Phase 5).

## Acceptance criteria
- [ ] Flyway migration `V2__create_ocr_results.sql` applies cleanly on top of `V1`.
- [ ] `POST /api/v1/media/{id}/ocr` persists OCR record and returns HTTP 201 with `OcrResultResponse`.
- [ ] `GET /api/v1/media/{id}/ocr` returns HTTP 200 with persisted OCR data or HTTP 404 if not yet processed.
- [ ] Ownership validation verifies media belongs to the requesting user before reading or writing OCR.
- [ ] Backend tests pass via `./gradlew test`.

## Relevant files and docs
- `apps/backend/src/main/resources/db/migration/V2__create_ocr_results.sql`
- `apps/backend/src/main/java/com/rewind/app/ocr/`
- `apps/backend/src/main/java/com/rewind/app/media/`
- `docs/architecture/DATABASE_DESIGN.md`
- `docs/api/openapi.yaml`

## Test plan
- Run `./gradlew test` to verify unit and web MVC tests.
