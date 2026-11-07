# TASK-0002: Camera Capture and Media Upload UI

## Status
Review

## Objective
Implement camera photo capture, gallery image selection, image preview confirmation modal, and backend upload service on the React Native mobile application.

## Context
Phase 1 Vertical Slice requires users to photograph or choose paper documents/receipts and upload them to the backend server with immediate visual feedback.

## Requirements
- [x] Install `expo-image-picker` and declare camera and photo permissions in `app.json`.
- [x] Implement feature-based architecture under `src/features/camera/`.
- [x] Create API service `mediaApi.ts` calling `POST /api/v1/media` and `GET /api/v1/media`.
- [x] Create hook `useMediaCapture.ts` handling camera launch, image picker, and upload state.
- [x] Create preview modal `ImagePreviewModal.tsx` showing captured photo, dimensions, file size, and upload/cancel actions.
- [x] Create action bar `CaptureBar.tsx` for capturing photo or opening gallery.
- [x] Update home screen `app/index.tsx` to list uploaded memories and trigger capture.

## Out of scope
- Local OCR scanning (Phase 2).
- Semantic search bar (Phase 5).

## Acceptance criteria
- [x] User can trigger camera or gallery picker.
- [x] Photo preview displays before upload.
- [x] Upload calls backend endpoint and updates memory list on success.
- [x] TypeScript check (`npx tsc --noEmit`) passes with zero errors.
- [x] Lint (`npx expo lint`) passes with zero errors.

## Relevant files and docs
- `apps/mobile/package.json`
- `apps/mobile/app.json`
- `apps/mobile/src/features/camera/`
- `apps/mobile/app/index.tsx`
