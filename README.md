# Rewind

**AI-powered mobile app for managing and extracting information from images.**

Rewind helps you capture documents, receipts, business cards, handwritten notes, and other paper-based content with your phone's camera. It uses AI vision models to extract text and structured data, making your physical-world information searchable and organized.

> **Current Status:** 🏗️ Bootstrap scaffold — no features are implemented yet. The repository structure, build systems, and documentation framework are in place. Only the backend health endpoint exists.

---

## MVP Features (Planned)

- 📸 Image capture and upload
- 🔍 AI-powered text extraction (OCR)
- 🤖 Structured data extraction (dates, amounts, contacts, etc.)
- 🏷️ Automatic tagging and categorization
- 📚 Image library with search
- 🔎 Full-text and semantic search
- 📱 Android-first mobile experience

---

## Technology Stack

| Component | Technology | Status |
|---|---|---|
| Mobile App | React Native + Expo + TypeScript | Scaffold |
| Backend API | Java 21 + Spring Boot + Gradle | Scaffold |
| Database | PostgreSQL | Planned |
| File Storage | Supabase Storage | Planned |
| AI Vision | Groq Vision API | Planned |
| AI Embeddings | Jina Embeddings API | Planned |
| API Style | REST + OpenAPI | Scaffold |

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
- Backend scaffold (Spring Boot project with health endpoint)
- Mobile scaffold (Expo project skeleton)
- Documentation framework

### 📋 Planned
- Image capture and upload
- OCR text extraction
- AI-powered structured data extraction
- Image library and browsing
- Search (full-text and semantic)
- User authentication
- Cloud storage integration
- Database schema and migrations
