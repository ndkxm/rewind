# Technical Implementation Guide

> Status: Proposed technical choices and implementation guidelines for Rewind.
> See [AGENTS.md](../../AGENTS.md) for agent operating rules and [ROADMAP.md](ROADMAP.md) for release milestones.

---

## 1. Technology Choices and Rationale

| Layer | Selection | Rationale | Alternatives Considered |
|---|---|---|---|
| **Mobile App** | React Native + Expo + TypeScript | Rapid cross-platform development with primary Android target, clean file-based routing with Expo Router | Flutter, Native Kotlin, Pure React Native CLI |
| **Mobile Navigation** | Expo Router | File-based, deep linking support out-of-the-box, intuitive directory convention | React Navigation standalone |
| **Backend Framework** | Java 21 + Spring Boot 3.x | Mature enterprise-grade modular monolith, robust typing, virtual threads, extensive ecosystem | Node.js/NestJS, Go, Python/FastAPI |
| **Backend Build** | Gradle (Kotlin DSL) | Modern, expressive, standardized within Spring Boot ecosystem | Maven, Gradle Groovy DSL |
| **Database** | PostgreSQL + Flyway | ACID-compliant relational data modeling, schema evolution via versioned migrations | MySQL, MongoDB |
| **Vector Search** | PostgreSQL with pgvector (Planned) | Keeps vector data inside the same database without running a separate vector DB service | Pinecone, Qdrant, Milvus |
| **Object Storage** | Supabase Storage (Planned) | Managed S3-compatible private object storage with signed URL capability | AWS S3, Cloudflare R2 |
| **Vision AI** | Groq Vision (Planned) | Fast inference speed, managed API with image understanding | OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet |
| **Embedding** | Jina Embeddings (Planned) | High-performance multimodal/text embeddings for semantic search | OpenAI text-embedding-3, Voyage AI |

---

## 2. Environment Setup

### Prerequisites
- **Node.js**: v20+ (tested with v24 LTS)
- **npm**: v10+
- **Java JDK**: 21 (Eclipse Temurin recommended)
- **Git**: 2.x
- **Docker**: For running PostgreSQL locally

### Local Secrets Configuration
Copy `.env.example` at the repository root to `.env`:
```bash
cp .env.example .env
```
Populate local database and service credentials. **Never commit `.env` or any production secrets to Git.**

---

## 3. Open Technical Decisions (Require Human Review)

As stated in the bootstrap specification, the following choices are deliberately **open** and require explicit owner confirmation:
1. Final application display name, package ID, and Android application ID.
2. Authentication strategy (JWT with refresh token vs session cookies).
3. OCR execution model: fully on-device (ML Kit) vs server-side fallback.
4. Specific Groq Vision model ID and Jina embedding model selection.
5. Supabase Storage vs AWS S3 / Cloudflare R2 for production media storage.
6. Final database schema and retention/deletion policy for user media and AI-derived metadata.
7. Inclusion of semantic search in the initial MVP Google Play release vs Phase 5 follow-up.
8. Production hosting provider and Google Play release configuration.

---

## 4. Testing Strategy

- **Mobile**:
  - TypeScript strict compile check: `npx tsc --noEmit`
  - Linting: `npx expo lint`
  - Unit/Component tests: Jest with `@testing-library/react-native` (configured when components are introduced)
- **Backend**:
  - Unit tests: JUnit 5 with Mockito for isolated domain/application logic
  - Integration tests: `@SpringBootTest` with `MockMvc` for controller and API contract validation
  - Test command: `./gradlew test` (or `gradlew.bat test` on Windows)
