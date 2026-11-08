# Rewind

**AI-powered mobile app for managing and extracting information from images.**

Rewind helps you capture documents, receipts, business cards, handwritten notes, and other paper-based content with your phone's camera. It uses AI vision models to extract text and structured data, making your physical-world information searchable and organized.

> **Current Status:** 🚧 Phase 1 complete (in review) — image capture, upload, and media listing work end-to-end. Phase 2 (on-device OCR) is next; its tasks are ready but not yet implemented. See [docs/implementation/STATUS.md](docs/implementation/STATUS.md) for details.

---

## MVP Features

- 📸 Image capture and upload — ✅ implemented (Phase 1)
- 🔍 AI-powered text extraction (OCR) — Phase 2
- 🤖 Structured data extraction (dates, amounts, contacts, etc.) — Phase 3
- 🏷️ Automatic tagging and categorization — Phase 4
- 📚 Image library with search — Phase 4
- 🔎 Full-text and semantic search — Phases 4–5
- 📱 Android-first mobile experience — ✅ (Expo, Android-first)

---

## Technology Stack

| Component | Technology | Status |
|---|---|---|
| Mobile App | React Native + Expo + TypeScript | Implemented (Phase 1) |
| Backend API | Java 21 + Spring Boot + Gradle | Implemented (Phase 1) |
| Database | PostgreSQL | Implemented (migrations V1, V2) |
| File Storage | Supabase Storage | Implemented |
| AI Vision | Groq Vision API | Planned (Phase 3) |
| AI Embeddings | Jina Embeddings API | Planned (Phase 5) |
| API Style | REST + OpenAPI | Implemented |

---

## Repository Structure

```
rewind/
├── apps/
│   ├── mobile/              # React Native + Expo app
│   │   ├── app/             # Expo Router pages
│   │   ├── src/             # Source code (features, shared, etc.)
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── backend/             # Spring Boot application
│       ├── src/
│       │   ├── main/java/   # Application source
│       │   └── test/java/   # Tests
│       ├── build.gradle
│       └── settings.gradle
├── docs/
│   ├── product/             # Product requirements
│   ├── architecture/        # System & component architecture
│   ├── api/                 # OpenAPI specifications
│   ├── implementation/      # Technical details & roadmap
│   ├── decisions/           # Architecture Decision Records
│   └── tasks/               # Task tracking
├── infra/                   # Infrastructure configs (planned)
├── AGENTS.md                # AI agent instructions
├── CLAUDE.md                # Claude-specific instructions
└── README.md                # This file
```

---

## Prerequisites

- **Node.js** 18+ (for mobile app)
- **Java** 21 (for backend)
- **Git** 2.x+
- **Android Studio** or Android device (for mobile testing)

---

## Getting Started

### Mobile App

```bash
# Navigate to the mobile app
cd apps/mobile

# Install dependencies
npm install

# Start the Expo development server
npx expo start

# Type-check
npx tsc --noEmit

# Lint
npx expo lint
```

### Backend

```bash
# Navigate to the backend
cd apps/backend

# Build (includes running tests)
./gradlew build

# Run tests only
./gradlew test

# Start the server
./gradlew bootRun
```

The backend will start on `http://localhost:8080`. Verify with:

```bash
curl http://localhost:8080/api/v1/health
```

---

## Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

See `.env.example` for the required variables and their descriptions.

> ⚠️ Never commit `.env` files or real credentials to the repository.

---

## Test Commands

| Scope | Command |
|---|---|
| Backend build + test | `cd apps/backend && ./gradlew build` |
| Backend tests only | `cd apps/backend && ./gradlew test` |
| Mobile type-check | `cd apps/mobile && npx tsc --noEmit` |
| Mobile lint | `cd apps/mobile && npx expo lint` |

---

## Documentation

| Document | Description |
|---|---|
| [Project Status](docs/implementation/STATUS.md) | Single source of truth for current implementation state |
| [Product Overview](docs/product/PRODUCT_OVERVIEW.md) | Problem statement, target users, scope |
| [System Architecture](docs/architecture/SYSTEM_ARCHITECTURE.md) | High-level system design |
| [Mobile Architecture](docs/architecture/MOBILE_ARCHITECTURE.md) | Mobile app structure and patterns |
| [Backend Architecture](docs/architecture/BACKEND_ARCHITECTURE.md) | Backend modules and layers |
| [AI Pipeline](docs/architecture/AI_PIPELINE.md) | Image processing pipeline design |
| [Database Design](docs/architecture/DATABASE_DESIGN.md) | Data model and schema |
| [API Specification](docs/api/openapi.yaml) | OpenAPI 3.0 spec |
| [Technical Implementation](docs/implementation/TECHNICAL_IMPLEMENTATION.md) | Tech choices and conventions |
| [Roadmap](docs/implementation/ROADMAP.md) | Development phases and timeline |
| [Architecture Decisions](docs/decisions/README.md) | ADR index and process |
| [Task Tracking](docs/tasks/README.md) | Task workflow and templates |

---

## For AI Agents

> **Read [`AGENTS.md`](AGENTS.md) first** before starting any work on this project.
> It contains all project rules, conventions, build commands, and safety guidelines.

---

## Current Project Status

### ✅ Implemented
- Repository structure (monorepo layout)
- Backend: health check, media upload (single + batch), media listing, ownership validation
- Database: `users` and `media` tables (Flyway migrations V1, V2)
- Storage: Supabase Storage integration with signed view URLs
- Mobile: camera capture, gallery picker, upload, library grid/list with status badges
- Documentation framework

### 📋 Planned
- OCR text extraction (Phase 2)
- AI-powered structured data extraction (Phase 3)
- Library search and tagging (Phase 4)
- Semantic search (Phase 5)
- User authentication
