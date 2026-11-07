# TASK-0004: Mobile On-Device OCR Integration and Text Display

## Status
Ready

## Objective
Integrate on-device optical character recognition (OCR) on the React Native mobile application, sync extracted text to the backend upon document capture, and display the extracted text inside the document detail view.

## Context
Phase 2 enables immediate client-side text recognition on captured documents and receipts. By performing OCR on-device or right after capture, users get immediate feedback on scanned content, and the backend receives recognized text for indexing and future AI structuring.

## Requirements
- [ ] Research and configure mobile OCR library compatible with Expo SDK 58 (e.g., ML Kit Text Recognition native module or compatible plugin).
- [ ] Create `ocrService.ts` in `src/features/camera/services/` or `src/features/ocr/` to run text recognition on selected/captured images.
- [ ] Connect OCR workflow to `useMediaCapture`: trigger text extraction after image capture or preview confirmation.
- [ ] Send extracted text payload to backend endpoint `POST /api/v1/media/{id}/ocr`.
- [ ] Enhance `DocumentDetailModal.tsx` to fetch and render raw extracted text with a "Copy Text" button and confidence badge.
- [ ] Handle error states when text cannot be detected or OCR service fails.
- [ ] Ensure strict TypeScript types and zero lint errors.

## Out of scope
- Structured field classification via Groq Vision LLM (Phase 3).
- Full-text search bar execution (Phase 4).

## Acceptance criteria
- [ ] Captured images undergo text recognition.
- [ ] Extracted text is successfully submitted to the backend OCR endpoint.
- [ ] Document detail view shows extracted text lines and allows copying text.
- [ ] TypeScript check (`npx tsc --noEmit`) passes with zero errors.
- [ ] Lint check (`npx expo lint`) passes with zero errors.

## Relevant files and docs
- `apps/mobile/src/features/camera/components/DocumentDetailModal.tsx`
- `apps/mobile/src/features/camera/hooks/useMediaCapture.ts`
- `apps/mobile/src/features/camera/services/mediaApi.ts`
- `docs/architecture/AI_PIPELINE.md`
- `docs/tasks/backend/TASK-0003-ocr-entity-and-api.md`

## Test plan
- Run `npx tsc --noEmit` and `npx expo lint`.
- Verify on mobile emulator/device with a sample receipt or document image.
