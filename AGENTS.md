# AGENTS.md — Shared Instructions for AI Coding Agents

> This file contains shared instructions for ALL AI coding agents working on the Rewind project.
> Read this file **first** before starting any task.

---

## Project Summary

**Rewind** is an AI-powered mobile application for managing and extracting information from images. Users photograph documents, receipts, business cards, notes, and other paper-based content. Rewind uses AI vision models to extract text and structured data, making that information searchable and organized.

**Current Status:** Bootstrap scaffold only. No features are implemented beyond a health endpoint.

---

## Repository Map

This is a **monorepo** organized as follows:

```
rewind/
├── apps/
│   ├── mobile/          # React Native + Expo + TypeScript (Android-first)
│   └── backend/         # Java 21 + Spring Boot + Gradle (modular monolith)
├── docs/
│   ├── product/         # Product requirements and overview
│   ├── architecture/    # System and component architecture
│   ├── api/             # OpenAPI specifications
│   ├── implementation/  # Technical implementation details and roadmap
│   ├── decisions/       # Architecture Decision Records (ADRs)
│   └── tasks/           # Task definitions and tracking
├── infra/               # Infrastructure and deployment configs (planned)
├── AGENTS.md            # THIS FILE — shared agent instructions
├── CLAUDE.md            # Claude-specific instructions
└── README.md            # Developer/agent onboarding
```

---

## Mobile Rules (`apps/mobile/`)

- **Feature-based organization:** Group code by feature, not by type. Each feature gets its own directory under `src/features/` containing components, screens, hooks, services, and types.
- **No direct HTTP in components:** Components must never make HTTP calls directly. All API communication goes through service modules in the feature's `services/` directory or a shared API layer.
- **TypeScript strict mode:** All code must be written in TypeScript with strict mode enabled. No `any` types unless explicitly justified with a comment.
- **No secrets in the app:** Never embed API keys, tokens, or credentials in mobile code. All sensitive operations go through the backend.
- **Expo conventions:** Follow Expo Router file-based routing. Use Expo SDK APIs for device features (camera, file system, etc.).
- **Imports:** Use path aliases where configured. Prefer named exports over default exports.

---

## Backend Rules (`apps/backend/`)

- **Modular monolith:** The backend is organized as a modular monolith. Each module (auth, user, media, processing, extraction, search, storage, common) has its own package with clearly defined boundaries.
- **Layer dependencies:** Each module follows a layered architecture:
  - `presentation` → `application` → `domain` ← `infrastructure`
  - Presentation depends on application. Application depends on domain. Infrastructure depends on domain. Domain depends on nothing within the module.
  - **Never** have domain depend on infrastructure or presentation.
- **Java 21 + Spring Boot:** Use Java 21 features (records, sealed classes, pattern matching) where appropriate. Follow Spring Boot conventions.
- **Gradle build:** The project uses Gradle for builds. Do not switch to Maven.
- **Cross-module communication:** Modules communicate through well-defined interfaces (application services or domain events). Never reach into another module's internals.

---

## Security and Privacy Rules

- **No committed secrets:** Never commit API keys, passwords, tokens, or credentials to the repository. Use environment variables and `.env` files (which are gitignored).
- **Validate ownership:** Every API endpoint that accesses user data must validate that the requesting user owns that data. No endpoint should return another user's data.
- **Private storage:** All user-uploaded media must be stored in private buckets/paths. Public access to user content is never acceptable.
- **HTTPS only:** All communication between mobile app and backend must use HTTPS. Never allow HTTP in production.
- **Input validation:** Validate all input on the backend. Never trust client-provided data.

---

## AI Provider Rules

- **Keys only on backend:** AI provider API keys (Groq, Jina, etc.) must only exist on the backend. The mobile app never communicates directly with AI providers.
- **Validate LLM output:** Never trust LLM-generated output blindly. Always validate structure, types, and content before storing or displaying results.
- **Provider interface pattern:** Abstract AI providers behind interfaces so providers can be swapped without changing business logic. For example, define a `VisionService` interface that `GroqVisionService` implements.
- **Error handling:** AI provider calls can fail, time out, or return malformed data. Always handle these cases gracefully with retries and fallback states.

---

## Build and Test Commands

### Mobile (`apps/mobile/`)

```bash
# Start development server
cd apps/mobile && npx expo start

# Type-check (no emit)
npx tsc --noEmit

# Lint
npx expo lint
```

### Backend (`apps/backend/`)

```bash
# Build (includes tests)
cd apps/backend && ./gradlew build

# Run tests only
./gradlew test

# Run the application
./gradlew bootRun
```

---

## Documentation Rules

- **Update docs with code changes:** When implementing a feature, update relevant documentation in the same commit or PR. Keep architecture docs, API specs, and implementation notes in sync with the code.
- **Keep OpenAPI in sync:** When adding or modifying API endpoints, update `docs/api/openapi.yaml` to reflect the changes.
- **ADRs for significant decisions:** Create an Architecture Decision Record (ADR) in `docs/decisions/` for any significant architectural or technology choice.
- **Label status accurately:** Always label features, components, and endpoints as either **IMPLEMENTED** or **PROPOSED/PLANNED**. Never fabricate implementation status.

---

## Git Safety

- **Don't commit without permission:** Never run `git commit` or `git push` unless explicitly instructed by the user.
- **Don't modify unrelated files:** Limit changes to files relevant to the current task. If you notice issues in unrelated files, report them but don't fix them without permission.
- **Review diff before committing:** Always review the full diff of changes before suggesting a commit. Ensure no unintended modifications are included.
- **Meaningful commit messages:** Use conventional commit format (e.g., `feat:`, `fix:`, `docs:`, `chore:`).

---

## Critical Rule

> **Never fabricate implementation status.** If a feature, endpoint, or component is not yet implemented, say so clearly. Do not describe planned features as if they already exist. The health endpoint (`GET /api/v1/health`) is currently the **only** implemented endpoint.

---

## Sources of Truth (Priority Order)

When information conflicts, trust sources in this order:

1. **Code** — The actual implementation is the ultimate truth
2. **ADRs** (`docs/decisions/`) — Accepted architectural decisions
3. **OpenAPI spec** (`docs/api/openapi.yaml`) — API contract
4. **Architecture docs** (`docs/architecture/`) — System design
5. **Product docs** (`docs/product/`) — Requirements and scope
6. **Implementation docs** (`docs/implementation/`) — Technical details and roadmap
7. **Task files** (`docs/tasks/`) — Work items and progress
8. **Chat/conversation** — Ephemeral context from the current session
