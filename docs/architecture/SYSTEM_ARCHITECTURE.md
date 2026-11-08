# System Architecture — Rewind

> **Status:** PARTIALLY IMPLEMENTED. Phase 1 (capture, upload, media listing) is implemented; the AI processing stages (OCR onwards) are PLANNED. See [STATUS.md](../implementation/STATUS.md).

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MOBILE DEVICE                               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Rewind Mobile App                              │    │
│  │         (React Native + Expo + TypeScript)                  │    │
│  │                                                             │    │
│  │  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐  │    │
│  │  │ Camera   │  │ Library   │  │ Search   │  │ Detail   │  │    │
│  │  │ Capture  │  │ Browse    │  │          │  │ View     │  │    │
│  │  └──────────┘  └───────────┘  └──────────┘  └──────────┘  │    │
│  │                       │                                     │    │
│  │                  ┌────┴────┐                                │    │
│  │                  │ API     │                                │    │
│  │                  │ Layer   │                                │    │
│  │                  └────┬────┘                                │    │
│  └───────────────────────┼─────────────────────────────────────┘    │
│                          │                                          │
└──────────────────────────┼──────────────────────────────────────────┘
                           │ HTTPS (REST API)
                           │
┌──────────────────────────┼──────────────────────────────────────────┐
│                     BACKEND SERVER                                  │
│                                                                     │
│  ┌───────────────────────┴─────────────────────────────────────┐    │
│  │              Rewind Backend API                             │    │
│  │         (Java 21 + Spring Boot + Gradle)                    │    │
│  │                                                             │    │
│  │  ┌──────┐ ┌──────┐ ┌───────┐ ┌────────────┐ ┌──────────┐  │    │
│  │  │ Auth │ │ User │ │ Media │ │ Processing │ │ Search   │  │    │
│  │  └──────┘ └──────┘ └───┬───┘ └──────┬─────┘ └──────────┘  │    │
│  │                        │            │                       │    │
│  └────────────────────────┼────────────┼───────────────────────┘    │
│                           │            │                            │
└───────────────────────────┼────────────┼────────────────────────────┘
                            │            │
              ┌─────────────┼────────────┼─────────────┐
              │             │            │             │
              ▼             ▼            ▼             ▼
       ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
       │ PostgreSQL │ │ Supabase │ │ Groq     │ │ Jina         │
       │ Database   │ │ Storage  │ │ Vision   │ │ Embeddings   │
       │            │ │          │ │ API      │ │ API          │
       └────────────┘ └──────────┘ └──────────┘ └──────────────┘
         MANAGED        MANAGED      EXTERNAL      EXTERNAL
```

---

## Components

### Mobile App (React Native + Expo + TypeScript)

- **Responsibility:** User interface, image capture, local state, API communication
- **Platform:** Android-first (Expo enables iOS later)
- **Key features:** Camera integration, image library browsing, search interface, extracted data display
- **Does NOT:** Process images, call AI APIs directly, store permanent data locally
- **Status:** Implemented (Phase 1): camera capture, gallery picker, upload, library

### Backend API (Java 21 + Spring Boot)

- **Responsibility:** Business logic, authentication, image processing orchestration, data persistence, AI provider integration
- **Architecture:** Modular monolith (see [Backend Architecture](BACKEND_ARCHITECTURE.md))
- **API:** RESTful, versioned (`/api/v1/`), documented via OpenAPI
- **Status:** Implemented (Phase 1): health check + media upload/list endpoints

### PostgreSQL Database

- **Responsibility:** Persistent storage of user accounts, image metadata, extracted text, structured data, tags, processing status
- **Access:** Backend only (never directly from mobile)
- **Migrations:** Flyway (implemented; V1, V2 applied)
- **Schema:** See [Database Design](DATABASE_DESIGN.md)
- **Status:** Implemented (partial): `users` and `media` tables created

### Supabase Storage

- **Responsibility:** Blob storage for uploaded images
- **Access:** Backend-mediated (mobile uploads through the backend API, which stores to Supabase)
- **Privacy:** All buckets/paths are private; no public URLs
- **Status:** Implemented (private bucket + signed view URLs)

### Groq Vision API

- **Responsibility:** OCR and AI vision analysis of uploaded images
- **Access:** Backend only — API key never exposed to mobile
- **Usage:** Extracts text (OCR) and structured data (dates, amounts, names) from images
- **Status:** PLANNED — not integrated

### Jina Embeddings API

- **Responsibility:** Generates vector embeddings of extracted text for semantic search
- **Access:** Backend only
- **Usage:** Converts extracted text into vectors stored alongside text data for similarity search
- **Status:** PLANNED — not integrated

---

## Data Flow

### Image Capture → Processing → Retrieval

```
1. CAPTURE       User takes photo with mobile camera
                          │
2. UPLOAD        Mobile sends image to Backend API via HTTPS
                          │
3. STORE         Backend stores image in Supabase Storage
                          │
4. OCR           Mobile runs on-device ML Kit; submits extracted text to backend (Phase 2)
                          │
5. AI ANALYSIS   Backend sends image + OCR text to Groq Vision for structured extraction
                          │
6. EMBED         Backend sends extracted text to Jina for vector embeddings
                          │
7. PERSIST       Backend stores all results (OCR text, structured data, embeddings) in PostgreSQL
                          │
8. RESPOND       Backend returns processing status and results to mobile
                          │
9. DISPLAY       Mobile displays extracted information alongside original image
```

### Search Flow

```
1. QUERY         User enters search terms in mobile app
                          │
2. REQUEST       Mobile sends search query to Backend API
                          │
3. SEARCH        Backend performs full-text search (PostgreSQL) and/or semantic search (embeddings)
                          │
4. RANK          Backend combines and ranks results
                          │
5. RETURN        Backend returns matching images with metadata
                          │
6. DISPLAY       Mobile shows search results in library view
```

---

## Deployment Boundaries

| Boundary | Components | Environment |
|---|---|---|
| **On Device** | Mobile app | User's Android device |
| **Backend Server** | Spring Boot API | Single server or container (cloud-hosted) |
| **Managed Database** | PostgreSQL | Cloud-managed instance (e.g., Supabase DB, Railway, etc.) |
| **Managed Storage** | Supabase Storage | Supabase-hosted blob storage |
| **External APIs** | Groq Vision, Jina Embeddings | Third-party SaaS |

---

## Communication Patterns

### REST API (Synchronous)

- All mobile-to-backend communication is via REST over HTTPS.
- API is versioned: `/api/v1/`.
- Authentication via bearer tokens (JWT, planned).
- See [OpenAPI specification](../api/openapi.yaml) for the full API contract.

### Asynchronous Processing

- Image processing (OCR, AI extraction, embedding) is inherently slow (seconds to tens of seconds).
- The backend accepts uploads and returns immediately with a processing status.
- The mobile app polls or uses a callback mechanism to check processing completion.
- Processing states are tracked per image (see [AI Pipeline](AI_PIPELINE.md) for state machine details).

### Backend → External Services

- All external API calls (Groq, Jina, Supabase Storage) are made from the backend.
- Calls include retry logic, timeouts, and circuit-breaker patterns (planned).
- Provider interfaces allow swapping implementations without changing business logic.
