# ADR-0001: Single Monorepo without Monorepo Framework
- Status: Accepted
- Date: 2026-11-07
- Decision owners: Architecture & Engineering Team

## Context
Rewind requires developing both an Android-first mobile application (React Native / Expo) and a backend API server (Java 21 / Spring Boot), along with shared OpenAPI specifications, architectural documentation, and infrastructure definitions. We need to decide how to structure the repository.

## Options
1. **Multi-repo**: Separate git repositories for `mobile`, `backend`, and `docs`.
2. **Monorepo with framework** (Turborepo, Nx, or pnpm workspaces).
3. **Single Git Monorepo without specialized framework**: A clean, single Git repository with `apps/mobile` and `apps/backend` organized as independent sub-projects.

## Decision
We chose **Option 3: Single Git Monorepo without specialized framework**.

### Reasons:
- Keeps documentation, API contracts (`openapi.yaml`), mobile code, and backend code synchronized in atomic commits.
- Eliminates overhead and complexity of configuring heavy monorepo build tools that mix polyglot ecosystems (Node.js + Gradle).
- AI coding agents can inspect both sides of the application and the API contracts without navigating multiple repositories.
- `apps/mobile` and `apps/backend` maintain completely independent build tooling (`npm`/`expo` and `gradlew`).

## Consequences
- **Positive**: Single pull request can change API spec, backend endpoint, and mobile consumer simultaneously. Shared documentation is centralized.
- **Trade-off**: Git history is shared; developers must not accidentally run commands from the root when they belong in `apps/mobile` or `apps/backend`.
- **Mitigation**: Clear directory layout and CI path filtering (`paths:` triggers in GitHub Actions) ensure independent CI runs.

## Follow-up
If repository size or polyglot tooling conflicts emerge at scale, evaluate targeted monorepo tooling or splitting after MVP release.
