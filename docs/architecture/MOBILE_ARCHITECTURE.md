# Mobile Architecture — Rewind

> **Status:** IMPLEMENTED in part. The `camera` feature (capture, upload, library) is implemented; the remaining features are placeholder stubs. See [STATUS.md](../implementation/STATUS.md).

---

## Overview

The Rewind mobile app is built with **React Native + Expo + TypeScript**, targeting Android first. It uses Expo Router for navigation and follows a feature-based code organization pattern.

---

## Feature-Based Organization

Code is organized by feature, not by type. Each feature is a self-contained module with its own components, screens, hooks, services, and types.

```
apps/mobile/
├── app/                         # Expo Router pages (file-based routing)
│   ├── _layout.tsx              # Root Stack layout (header hidden)
│   └── index.tsx                # Home / Library screen
├── src/
│   ├── api/
│   │   └── client.ts            # Centralized API base URL (EXPO_PUBLIC_API_URL)
│   ├── features/
│   │   ├── camera/              # Image capture feature (IMPLEMENTED)
│   │   │   ├── components/      # CaptureBar, ImagePreviewModal, DocumentDetailModal
│   │   │   ├── hooks/           # useMediaCapture
│   │   │   ├── services/        # mediaApi (upload, batch, fetch)
│   │   │   ├── types.ts         # ProcessingStatus, MediaItem, etc.
│   │   │   ├── status.ts        # STATUS_META status → label/color mapping
│   │   │   └── index.ts         # Public exports
│   │   ├── auth/                # Placeholder (PLANNED)
│   │   ├── gallery/             # Placeholder (PLANNED)
│   │   ├── memories/            # Placeholder (PLANNED)
│   │   ├── processing/          # Placeholder (PLANNED)
│   │   ├── search/              # Placeholder (PLANNED)
│   │   └── settings/            # Placeholder (PLANNED)
│   ├── components/              # Shared components placeholder
│   ├── services/                # Shared services placeholder
│   ├── store/                   # Shared state placeholder
│   ├── types/                   # Shared types placeholder
│   ├── utils/                   # Shared utilities placeholder
│   └── theme/                   # Design tokens (colors, spacing, typography)
├── assets/                      # Static assets (app icons, splash)
├── package.json
├── tsconfig.json
├── app.json                     # Expo configuration
├── .env.example                 # Environment variable template
└── .gitignore
```

---

## Navigation

### Expo Router (File-Based Routing)

Navigation is handled by **Expo Router**, which uses the file system under `app/` to define routes. This is analogous to Next.js file-based routing.

- `app/_layout.tsx` — Root Stack layout (header hidden)
- `app/index.tsx` — Home / Library screen (implemented)
- `app/(tabs)/` and `app/media/[id].tsx` — planned for later phases

**Conventions:**
- Route files in `app/` are thin wrappers that render screen components from `src/features/`.
- Business logic lives in feature modules, not in route files.

---

## State Management

> **Decision pending:** State management approach is undecided. Options under consideration:

| Option | Pros | Cons |
|---|---|---|
| **Zustand** | Lightweight, simple API, TypeScript-friendly, no boilerplate | Additional dependency, less ecosystem support than Redux |
| **React Context + useReducer** | Built-in, no dependencies, well-understood | Verbose for complex state, potential re-render issues |

**Interim approach:** Use React Context for simple shared state (auth, theme). Evaluate Zustand when feature complexity warrants it.

**Regardless of choice, these rules apply:**
- State that is local to one screen stays local (useState).
- State shared across a single feature uses feature-level context or store.
- State shared across features (auth, user profile) uses app-level store.
- Server state (API responses) should use a data-fetching library pattern with caching.

---

## API Layer Conventions

### Rule: No Direct HTTP in Components

Components and screens must **never** make HTTP calls directly. All API communication flows through the API layer.

```
Component → Feature Hook → Feature Service → API Client → Backend
```

### API Client (`src/api/client.ts`)

- Centralized base URL configuration: exports `API_BASE_URL` sourced from `EXPO_PUBLIC_API_URL` (see `apps/mobile/.env.example`); `localhost:8080` is the dev fallback — no hardcoded LAN IP.
- Standardized error handling, auth token injection, and interceptors are still PLANNED; the full `apiClient` wrapper will be introduced in a later phase.

### Feature Services (`src/features/*/services/`)

- Each feature has its own service module that calls the API client
- Services return typed data, handling any response transformation
- Example: `src/features/library/services/mediaService.ts`

```typescript
// Example (PROPOSED — not implemented)
export const mediaService = {
  getAll: (params: ListMediaParams): Promise<MediaListResponse> => {
    return apiClient.get('/api/v1/media', { params });
  },
  getById: (id: string): Promise<MediaDetailResponse> => {
    return apiClient.get(`/api/v1/media/${id}`);
  },
  upload: (file: ImageFile): Promise<UploadResponse> => {
    return apiClient.postForm('/api/v1/media', { file });
  },
};
```

---

## Feature Module Structure

Every feature follows this structure:

```
src/features/<feature-name>/
├── components/          # UI components specific to this feature
│   ├── MediaCard.tsx
│   └── MediaGrid.tsx
├── screens/             # Screen-level components (rendered by Expo Router pages)
│   └── LibraryScreen.tsx
├── hooks/               # Custom hooks for this feature
│   ├── useMediaList.ts
│   └── useMediaUpload.ts
├── services/            # API service calls
│   └── mediaService.ts
├── types/               # TypeScript types and interfaces
│   └── index.ts
└── index.ts             # Public exports (only export what other features need)
```

### Export Rules

- `index.ts` defines the public API of the feature.
- Other features may only import from the index, never from internal files.
- Shared components used by multiple features should be moved to `src/shared/components/`.

---

## Error Handling Patterns

Every screen that loads data must handle four states:

| State | What the User Sees |
|---|---|
| **Loading** | Skeleton placeholder or spinner |
| **Empty** | Friendly message explaining no data exists yet (e.g., "No images captured. Tap the camera to get started.") |
| **Error** | Error message with a "Retry" button |
| **Success** | The actual content |

### Implementation Pattern (Proposed)

```typescript
// PROPOSED pattern — not implemented
function LibraryScreen() {
  const { data, isLoading, error, refetch } = useMediaList();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!data?.length) return <EmptyState message="No images yet" />;

  return <MediaGrid items={data} />;
}
```

---

## Security

- **No API keys in the app:** All API keys and secrets live on the backend. The mobile app authenticates with user credentials and receives a session token.
- **Request permissions just-in-time:** Camera and storage permissions are requested only when the user initiates an action that needs them, never at app startup.
- **Token storage:** Auth tokens are stored in secure storage (Expo SecureStore), never in AsyncStorage or plain state.
- **Network security:** All API calls use HTTPS. The base URL is configured via environment variables, never hardcoded.
