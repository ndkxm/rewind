# ADR-0002: OCR Execution Model and Processing States
- Status: Accepted
- Date: 2026-11-08
- Decision owners: Rewind team

## Context

Phase 2 adds OCR to Rewind. Two documents disagreed on where OCR runs:

- `docs/implementation/ROADMAP.md` said "On-device OCR integration (Google ML Kit Text Recognition)".
- `docs/architecture/AI_PIPELINE.md` Step 3 said the backend sends the image to Groq Vision for OCR.

Additionally, the `media.processing_status` state machine in `AI_PIPELINE.md` listed six states
(`UPLOADED → PENDING → PROCESSING → OCR_COMPLETED → ANALYSIS_COMPLETED → COMPLETED`, plus `FAILED`),
but the code enum `ProcessingStatus` only defined four (`UPLOADED`, `PROCESSING`, `COMPLETED`, `FAILED`).
Phase 2 must reconcile both conflicts before implementation.

## Options

1. **On-device OCR only** (Google ML Kit): OCR runs on the phone; the app submits the extracted
   text to the backend for persistence.
2. **Backend OCR only** (Groq Vision): the backend downloads the image from storage and runs OCR
   via a vision LLM.
3. **Hybrid**: on-device OCR as primary, backend vision OCR as a fallback when confidence is low
   or no text is detected.

## Decision

**On-device OCR is the primary execution model for Phase 2. A backend fallback is deferred to Phase 3.**

- The mobile app runs Google ML Kit Text Recognition on the device and submits raw text to
  `POST /api/v1/media/{id}/ocr`.
- The backend persists the submitted text to `ocr_results` and sets `media.processing_status` to
  `OCR_COMPLETED`. The `provider` column records `mlkit` (the on-device engine).
- A server-side vision OCR fallback is added in Phase 3, after the `VisionService` interface and
  Groq adapter already exist for structured extraction.

We add exactly one new enum value — `OCR_COMPLETED` — to `ProcessingStatus`. The remaining proposed
states (`PENDING`, `ANALYSIS_COMPLETED`) stay documented-only until the phases that need them.

The mobile package is `@infinitered/react-native-mlkit-text-recognition` (an Expo module, MIT,
actively maintained), pending a compatibility check against Expo SDK 58 at implementation time.
Fallback candidate: `@react-native-ml-kit/text-recognition`.

## Consequences

- **Benefits:** Free, offline, private (images never leave the device for OCR), no dependency on
  `GROQ_API_KEY` in Phase 2, and no double AI cost later (Phase 3 reuses the image for structured
  extraction, not OCR).
- **Costs:** ML Kit is a native module, so OCR requires a development build (not Expo Go). OCR text
  is submitted to the backend rather than derived there, so the backend must trust and validate
  client-submitted OCR payloads (length limits, sanitization). Bounding boxes are not stored in MVP.
- **Consistency rule established:** any change to `ProcessingStatus` must be synced across three
  places — the Java enum (`media/domain/ProcessingStatus.java`), the OpenAPI enum
  (`MediaResponse.processingStatus`), and the mobile union type (`features/camera/types.ts`) — and
  reflected in the shared `STATUS_META` UI map.

## Follow-up

- Verify `@infinitered/react-native-mlkit-text-recognition` compatibility with Expo SDK 58 via
  `npx expo install` and versioned docs before finalizing the dependency.
- Implement graceful degradation so the app still runs in Expo Go (lazy native module import behind
  an `isOcrAvailable` flag).
- Revisit server-side OCR fallback during Phase 3 when `VisionService` is introduced.
