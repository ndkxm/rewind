# TASK-0001: Backend Media Upload and Supabase Storage Integration

## Status
Review

## Objective
Implement backend image upload REST endpoint (`POST /api/v1/media`), user media listing (`GET /api/v1/media`), Supabase Storage integration with private bucket, and PostgreSQL `media` table migration with Flyway.

## Context
Phase 1 Vertical Slice requires a reliable mechanism for the mobile application to upload captured documents, store image files in private object storage, record media metadata in PostgreSQL, and issue short-lived pre-signed URLs for preview.

## Requirements
- [x] Configure Spring Data JPA, PostgreSQL, and Flyway dependencies in Gradle.
- [x] Create Flyway migration `V1__create_users_and_media.sql` with `users` and `media` tables and indices.
- [x] Implement `StorageService` interface in `storage.domain` and `SupabaseStorageService` in `storage.infrastructure`.
- [x] Implement `Media` entity, `MediaRepository`, and `MediaService` in `media` module adhering to layered architecture.
- [x] Expose `POST /api/v1/media` accepting multipart file upload, returning HTTP 201 with `MediaResponse`.
- [x] Expose `GET /api/v1/media` returning user uploaded media items with pre-signed URLs.
- [x] Add automated unit and mock web tests.

## Out of scope
- Full JWT authentication filter (default demo user used for Phase 1 vertical slice).
- AI extraction pipeline and background processing worker (Phase 2 & 3).

## Acceptance criteria
- [x] `POST /api/v1/media` stores image and creates database record.
- [x] Flyway migrations run cleanly.
- [x] Unit tests pass via `./gradlew test`.

## Relevant files and docs
- `apps/backend/build.gradle.kts`
- `apps/backend/src/main/resources/db/migration/V1__create_users_and_media.sql`
- `apps/backend/src/main/java/com/rewind/app/storage/`
- `apps/backend/src/main/java/com/rewind/app/media/`
- `docs/api/openapi.yaml`

## Test plan
- Run `./gradlew test` to execute JUnit 5 WebMvcTest and Spring Boot tests.
