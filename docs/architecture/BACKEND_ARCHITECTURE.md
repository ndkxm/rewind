# Backend Architecture — Rewind

> **Status:** IMPLEMENTED in part. The `media` module (upload/list), `storage` integration, and `common` (health check) are implemented; the remaining modules are PLANNED. See [STATUS.md](../implementation/STATUS.md).

---

## Overview

The Rewind backend is a **modular monolith** built with **Java 21 + Spring Boot + Gradle**. It provides a RESTful API for the mobile app and orchestrates all server-side operations including authentication, image storage, AI processing, and search.

---

## Modular Monolith Pattern

The backend is organized as a modular monolith — a single deployable application with clear internal module boundaries. This gives us:

- **Simplicity:** One application to deploy, monitor, and debug
- **Modularity:** Clean boundaries between domains, enabling future extraction to services if needed
- **Developer velocity:** No network overhead between modules, simple local development
- **Data consistency:** Single database with transactional integrity across modules

See [ADR-0001](../decisions/ADR-0001-monorepo.md) for the monorepo decision that supports this architecture.

---

## Module List

| Module | Responsibility | Status |
|---|---|---|
| **auth** | User authentication, token management, session handling | Planned |
| **user** | User profile management, preferences | Planned |
| **media** | Image metadata, library management, CRUD operations | Implemented |
| **ocr** | Raw OCR text persistence and retrieval | Ready (Phase 2) |
| **processing** | Processing job orchestration, status tracking | Planned |
| **extraction** | AI-powered text and structured data extraction | Planned |
| **search** | Full-text and semantic search | Planned |
| **storage** | File storage abstraction (Supabase Storage integration) | Implemented |
| **common** | Shared utilities, base classes, cross-cutting concerns | Implemented |

---

## Package Structure

```
com.rewind/
├── auth/
│   ├── presentation/        # REST controllers, DTOs, request/response mapping
│   ├── application/         # Use cases, application services, command/query handlers
│   ├── domain/              # Entities, value objects, domain services, repository interfaces
│   └── infrastructure/      # Repository implementations, external service clients
├── user/
│   ├── presentation/
│   ├── application/
│   ├── domain/
│   └── infrastructure/
├── media/
│   ├── presentation/
│   ├── application/
│   ├── domain/
│   └── infrastructure/
├── ocr/
│   ├── presentation/
│   ├── application/
│   ├── domain/
│   └── infrastructure/
├── processing/
│   ├── presentation/
│   ├── application/
│   ├── domain/
│   └── infrastructure/
├── extraction/
│   ├── presentation/
│   ├── application/
│   ├── domain/
│   └── infrastructure/
├── search/
│   ├── presentation/
│   ├── application/
│   ├── domain/
│   └── infrastructure/
├── storage/
│   ├── application/
│   ├── domain/
│   └── infrastructure/
├── common/
│   ├── exception/           # Shared exception types
│   ├── model/               # Shared base classes (BaseEntity, etc.)
│   ├── util/                # Utility classes
│   └── config/              # Cross-cutting configuration
└── RewindApplication.java   # Spring Boot entry point
```

---

## Layer Structure

Each module follows a four-layer architecture:

```
┌─────────────────────────────────────┐
│         PRESENTATION                │   REST controllers, DTOs,
│    (Controllers, DTOs, Mappers)     │   request/response mapping
└───────────────┬─────────────────────┘
                │ depends on
                ▼
┌─────────────────────────────────────┐
│         APPLICATION                 │   Use cases, orchestration,
│    (Services, Commands, Queries)    │   transaction boundaries
└───────────────┬─────────────────────┘
                │ depends on
                ▼
┌─────────────────────────────────────┐
│           DOMAIN                    │   Entities, value objects,
│    (Entities, Repositories*,        │   domain logic, repository
│     Domain Services)                │   interfaces (not impls)
└───────────────▲─────────────────────┘
                │ depends on
                │
┌───────────────┴─────────────────────┐
│        INFRASTRUCTURE               │   Repository implementations,
│    (Repo Impls, External Clients,   │   external API clients,
│     Config)                         │   database config
└─────────────────────────────────────┘
```

### Layer Dependency Rules

These rules are **strict** and must not be violated:

| Rule | Description |
|---|---|
| **Presentation → Application** | Controllers call application services. Never call domain or infrastructure directly. |
| **Application → Domain** | Application services use domain entities and repository interfaces. Never use infrastructure classes directly. |
| **Infrastructure → Domain** | Infrastructure implements domain-defined interfaces (e.g., repository interfaces). |
| **Domain → Nothing** | Domain has zero dependencies on other layers within the module. It defines interfaces that infrastructure implements. |
| **No upward dependencies** | Infrastructure never depends on application or presentation. Application never depends on presentation. |

### What Goes Where

| Layer | Contains | Does NOT Contain |
|---|---|---|
| **Presentation** | `@RestController`, request/response DTOs, input validation annotations, DTO↔domain mappers | Business logic, database queries, external API calls |
| **Application** | `@Service`, `@Transactional`, use case orchestration, command/query objects | HTTP concerns, database implementation details, domain logic |
| **Domain** | Entities, value objects, domain services, repository interfaces, domain events, business rules | Spring annotations (except `@Entity`), HTTP concerns, implementation details |
| **Infrastructure** | `@Repository` implementations, `@Configuration`, external API clients, database-specific code | Business logic, HTTP controllers |

---

## Cross-Module Communication Rules

1. **Modules communicate through application services or domain events.** Module A calls Module B's application service interface, never its internal classes.

2. **No cross-module domain dependencies.** Module A's domain must not import Module B's domain entities. If data needs to flow between modules, use DTOs or domain events.

3. **Shared kernel in `common/`.** Truly shared concepts (base entity, common value objects, shared exceptions) live in the `common` module. Keep this minimal.

4. **Database tables are owned by modules.** Each module owns its tables. If Module A needs data from Module B's tables, it goes through Module B's application service, not direct SQL.

```
┌──────────┐         Interface         ┌──────────┐
│ Module A │ ──────────────────────── → │ Module B │
│          │   (application service)    │          │
│ media    │                            │ storage  │
└──────────┘                            └──────────┘
     ✓ Correct: media calls storage's application service

┌──────────┐                            ┌──────────┐
│ Module A │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ✗ → │ Module B │
│          │   (direct DB access)        │          │
│ media    │                            │ storage  │
└──────────┘                            └──────────┘
     ✗ Wrong: media directly accesses storage's tables
```

---

## Configuration Approach

### Spring Profiles

| Profile | Purpose |
|---|---|
| `default` | Local development defaults |
| `dev` | Development environment with debug logging |
| `test` | Test configuration (in-memory DB, mocked services) |
| `prod` | Production settings (strict security, optimized logging) |

### Environment Variables

All sensitive configuration is provided via environment variables, never hardcoded:

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `jdbc:postgresql://localhost:5432/rewind` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase service role key | `eyJ...` |
| `GROQ_API_KEY` | Groq API key for vision | `gsk_...` |
| `JINA_API_KEY` | Jina API key for embeddings | `jina_...` |
| `JWT_SECRET` | Secret for signing JWT tokens | (random string) |

### Configuration Files

```
apps/backend/src/main/resources/
├── application.yml              # Default configuration
├── application-dev.yml          # Dev overrides
├── application-test.yml         # Test overrides
└── application-prod.yml         # Production overrides
```
