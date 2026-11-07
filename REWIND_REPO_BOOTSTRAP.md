# Rewind --- Repository Bootstrap & AI Agent Handoff

> Mục đích: đặc tả khởi tạo repository Rewind. Đưa tài liệu này cho
> Claude Code để tạo skeleton project, tài liệu kiến trúc và bộ hướng
> dẫn dành cho các AI coding agent.
>
> Trạng thái: Bootstrap specification --- chưa có nghĩa các tính năng
> trong tài liệu đã được implement.

## 1. Product context

### Rewind là gì?

Rewind là ứng dụng mobile quản lý và khai thác thông tin từ hình ảnh
bằng AI. Người dùng có thể chụp ảnh hoặc chọn ảnh từ thư viện, lưu ảnh
vào Rewind, trích xuất văn bản bằng OCR, dùng AI phân tích và trích xuất
thông tin có cấu trúc, sau đó xem, chỉnh sửa, phân loại và tìm kiếm lại
thông tin.

Use cases ví dụ: hóa đơn, danh thiếp, ghi chú viết tay, poster sự kiện,
bảng thông tin và tài liệu in.

### Product principles

-   Image-first: MVP chỉ xử lý hình ảnh.
-   Mobile-first: ưu tiên Android, giữ khả năng mở rộng iOS.
-   Personal utility: ứng dụng tiện ích cá nhân, không phải SaaS đa
    tenant.
-   AI-assisted, user-controlled: người dùng có thể xem và sửa kết quả
    AI.
-   Evidence-based: thông tin trích xuất phải truy ngược được về ảnh
    nguồn/OCR.
-   Privacy by design: chỉ xin quyền thiết bị khi cần; thông báo rõ dữ
    liệu gửi đến AI provider.
-   Simple deployment: modular monolith và managed services; không
    microservices cho MVP.

### MVP in scope

1.  Đăng ký, đăng nhập, đăng xuất.
2.  Chụp ảnh và chọn ảnh từ gallery.
3.  Lưu ảnh vào thư viện Rewind.
4.  OCR.
5.  AI image understanding và structured extraction.
6.  Xem chi tiết ảnh và thông tin trích xuất.
7.  Chỉnh sửa thông tin AI trích xuất.
8.  Tag/category cơ bản.
9.  Tìm kiếm từ khóa.
10. Semantic search sau khi pipeline cơ bản ổn định.
11. Xóa ảnh và dữ liệu liên quan.
12. Trạng thái xử lý, lỗi và retry.
13. Chuẩn bị phát hành Android qua Google Play.

### Explicitly out of scope

-   PDF, DOCX hoặc xử lý tài liệu tổng quát.
-   Video, audio, real-time transcription.
-   Quét toàn bộ gallery tự động.
-   Chatbot đa năng hoặc agent tự hành.
-   Knowledge graph.
-   Microservices, Kubernetes, Kafka.
-   Tự host LLM lớn.
-   Chia sẻ xã hội/cộng tác nhiều người dùng.
-   Thanh toán/subscription.

Không tự ý mở rộng scope nếu chưa có quyết định mới.

## 2. Technology direction

Các lựa chọn dưới đây là định hướng ban đầu. Trước khi chốt
version/dependency, phải kiểm tra compatibility và tài liệu chính thức
hiện hành.

  -------------------------------------------------------------------------
  Area                    Preferred choice        Notes
  ----------------------- ----------------------- -------------------------
  Mobile                  React Native + Expo +   Android-first
                          TypeScript              

  Navigation              Expo Router             File-based routing

  Mobile state            Zustand hoặc Context    Không thêm nhiều state
                          khi phù hợp             libraries

  Camera                  Expo Camera hoặc giải   Kiểm tra quyền
                          pháp tương thích        

  Gallery                 Expo ImagePicker        Chỉ truy cập ảnh người
                                                  dùng chọn

  Save to gallery         Expo Media Library nếu  Xin quyền đúng lúc
                          cần                     

  On-device OCR           Google ML Kit Text      Kiểm tra native
                          Recognition             integration/Development
                                                  Build

  Backend                 Java 21 + Spring Boot   Modular monolith

  Build                   Gradle                  Chọn Groovy hoặc Kotlin
                                                  DSL, dùng nhất quán

  API                     REST + OpenAPI          Contract chung
                                                  mobile/backend

  Database                PostgreSQL              Schema bằng Flyway

  Vector search           pgvector                Chỉ thêm khi làm semantic
                                                  search

  Object storage          Supabase Storage        Backend quản lý access và
                                                  metadata

  AI vision               Groq Vision model có    Kiểm tra model ID trước
                          image input             khi implement

  Embedding               Jina Embeddings API     Kiểm tra model,
                          hoặc provider phù hợp   dimension, quota, terms

  Authentication          Spring Security         Chọn JWT/session strategy
                                                  rõ ràng

  Testing                 JUnit 5, Spring Boot    Test theo rủi ro
                          Test, mobile tests phù  
                          hợp                     

  CI                      GitHub Actions          Build/test mobile và
                                                  backend

  Container               Docker                  Backend/local
                                                  dependencies
  -------------------------------------------------------------------------

### Free-tier/provider policy

-   Free không đồng nghĩa quota vô hạn hoặc miễn phí vĩnh viễn.
-   Kiểm tra quota, rate limit, model availability, data retention và
    terms.
-   API key chỉ lưu ở backend secret/environment; tuyệt đối không nhúng
    Groq/Jina key trong mobile.
-   Dùng provider interface khi có ích cho việc thay thế provider; không
    xây abstraction framework quá mức.
-   Nếu provider không còn free hoặc không đáp ứng yêu cầu, đề xuất thay
    thế và ghi ADR trước khi đổi.

### AI processing responsibility

Pipeline định hướng:

1.  Mobile chụp/chọn ảnh.
2.  Mobile tạo preview và chạy OCR on-device nếu tích hợp ổn định.
3.  Mobile upload ảnh và OCR result lên backend.
4.  Backend lưu metadata và tạo processing job.
5.  Backend gọi vision model để tạo description và structured
    extraction.
6.  Backend validate output theo schema.
7.  Backend lưu kết quả, evidence và trạng thái.
8.  Backend tạo embedding từ text đã chuẩn hóa khi semantic search được
    triển khai.
9.  Mobile lấy trạng thái và hiển thị kết quả.

Không tin tưởng JSON do LLM trả về. Backend phải validate, normalize và
xử lý dữ liệu thiếu/sai. Kết quả AI không phải dữ liệu có thẩm quyền nếu
chưa được người dùng xác nhận.

## 3. Repository layout

Dùng **một monorepo**, một Git repository:

``` text
rewind/
├── apps/
│   ├── mobile/
│   │   ├── app/                         # Expo Router routes
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── camera/
│   │   │   │   ├── gallery/
│   │   │   │   ├── memories/
│   │   │   │   ├── processing/
│   │   │   │   ├── search/
│   │   │   │   └── settings/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   ├── theme/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── assets/
│   │   ├── __tests__/
│   │   ├── app.json
│   │   └── package.json
│   └── backend/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/<package-root>/
│       │   │   │   ├── RewindApplication.java
│       │   │   │   ├── auth/
│       │   │   │   ├── user/
│       │   │   │   ├── media/
│       │   │   │   ├── processing/
│       │   │   │   ├── extraction/
│       │   │   │   ├── search/
│       │   │   │   ├── storage/
│       │   │   │   └── common/
│       │   │   └── resources/
│       │   │       ├── application.yml
│       │   │       └── db/migration/
│       │   └── test/
│       ├── build.gradle
│       └── Dockerfile
├── docs/
│   ├── product/PRODUCT_OVERVIEW.md
│   ├── architecture/
│   │   ├── SYSTEM_ARCHITECTURE.md
│   │   ├── MOBILE_ARCHITECTURE.md
│   │   ├── BACKEND_ARCHITECTURE.md
│   │   ├── AI_PIPELINE.md
│   │   └── DATABASE_DESIGN.md
│   ├── api/openapi.yaml
│   ├── implementation/
│   │   ├── TECHNICAL_IMPLEMENTATION.md
│   │   └── ROADMAP.md
│   ├── decisions/
│   │   ├── README.md
│   │   └── ADR-0001-monorepo.md
│   └── tasks/
│       ├── README.md
│       ├── TASK_TEMPLATE.md
│       ├── mobile/
│       ├── backend/
│       └── integration/
├── infra/
│   ├── docker/
│   ├── supabase/
│   └── deployment/
├── .github/workflows/
│   ├── backend-ci.yml
│   └── mobile-ci.yml
├── .editorconfig
├── .gitattributes
├── .gitignore
├── .env.example
├── AGENTS.md
├── CLAUDE.md
├── README.md
└── LICENSE
```

Notes: - `<package-root>` phải thay bằng package Java hợp lệ, ví dụ
`com.rewind.app`; không để placeholder trong source. - Không tạo hàng
loạt folder/file rỗng. Chỉ tạo folder khi có nội dung hoặc lý do rõ
ràng. - Không thêm Nx, Turborepo, pnpm workspace hoặc framework monorepo
nếu chưa có nhu cầu. - `apps/mobile` và `apps/backend` là hai thư mục
con cùng cấp trong `apps/`.

## 4. Architecture rules

### Mobile

Dùng feature-based organization. Ví dụ:

``` text
features/memories/
├── components/
├── screens/
├── hooks/
├── services/
├── types/
└── index.ts
```

Rules: - Screen/component không gọi HTTP trực tiếp. - API calls đi qua
feature service hoặc API layer thống nhất. - Tách UI state và server
state; chỉ thêm state library khi cần. - Không để business logic phức
tạp trong component. - TypeScript strict mode. - Có loading, empty,
error và retry states. - Không lưu AI provider secrets trong app. - Xin
quyền camera/gallery đúng thời điểm.

### Backend

Dùng **Modular Monolith**, không microservices cho MVP. Tổ chức theo
business module; trong module dùng layers khi phù hợp:

``` text
media/
├── presentation/
│   ├── MediaController.java
│   └── dto/
├── application/
│   ├── UploadMediaUseCase.java
│   └── MediaService.java
├── domain/
│   ├── Media.java
│   └── MediaRepository.java
└── infrastructure/
    ├── persistence/
    └── storage/
```

  -----------------------------------------------------------------------
  Layer                               Responsibility
  ----------------------------------- -----------------------------------
  presentation                        REST controllers, request/response
                                      DTO, validation mapping

  application                         Use-case orchestration, transaction
                                      boundary

  domain                              Business rules, domain model,
                                      repository/provider ports

  infrastructure                      JPA, SQL, external APIs, storage
                                      implementations
  -----------------------------------------------------------------------

Dependency rules: - `presentation` gọi `application`. - `application`
phụ thuộc abstraction/domain, hạn chế phụ thuộc framework. -
`infrastructure` implement các port/interface ở layer trong. - `domain`
không phụ thuộc Spring MVC, JPA implementation, Groq SDK hoặc Supabase
SDK. - Không tạo interface cho mọi class. - Không tạo generic base
service/repository nếu chưa có nhu cầu.

### Processing pipeline

Trạng thái gợi ý: `UPLOADED`, `PENDING`, `PROCESSING`, `OCR_COMPLETED`,
`ANALYSIS_COMPLETED`, `COMPLETED`, `FAILED`.

Cần: - Persist trạng thái trong database. - Retry có giới hạn và error
code phù hợp. - Idempotency/chống xử lý trùng. - Timeout cho external
API. - Không giữ HTTP request mở trong toàn bộ AI processing. - MVP có
thể dùng executor/`@Async` kết hợp processing job được persist, nhưng
`@Async` không phải durable queue. - Chỉ cân nhắc RabbitMQ/queue riêng
khi nhu cầu thực tế chứng minh cần.

## 5. API contract rules

-   OpenAPI là contract chung mobile/backend.
-   Khi API thay đổi, cập nhật `docs/api/openapi.yaml` trong cùng task.
-   Request/response DTO có ví dụ và error response nhất quán.
-   Mobile không tự đoán response.
-   Có versioning khi breaking change; không cần phức tạp từ đầu.
-   Endpoint chứa dữ liệu cá nhân phải xác thực và kiểm tra ownership.

API groups dự kiến: - `/api/v1/auth` - `/api/v1/users` -
`/api/v1/media` - `/api/v1/processing` - `/api/v1/search` -
`/api/v1/tags`

Không implement tất cả endpoint trong bootstrap task.

## 6. AI-agent operating model

Mục tiêu: Claude Code, Codex và agent tương lai tiếp tục được dự án chỉ
bằng repository, không phụ thuộc chat history.

### Sources of truth

Thứ tự ưu tiên khi có mâu thuẫn:

1.  Code và tests hiện tại --- trạng thái đã implement.
2.  `docs/decisions/` --- quyết định đã được chấp thuận.
3.  `docs/api/openapi.yaml` --- API contract hiện hành.
4.  `docs/architecture/` --- kiến trúc được chấp thuận.
5.  `docs/product/PRODUCT_OVERVIEW.md` --- mục tiêu và scope.
6.  `docs/implementation/` --- hướng dẫn và roadmap.
7.  Task file --- phạm vi công việc hiện tại.
8.  Chat history --- context tạm thời, không phải nguồn chuẩn.

Nếu tài liệu mâu thuẫn với code: - Không tự rewrite code để khớp tài
liệu. - Báo cáo mâu thuẫn và đề xuất cập nhật. - Chỉ đổi kiến trúc sau
khi người dùng chấp thuận.

### AGENTS.md

File chung cho coding agents, cần ngắn gọn và có: - Project summary. -
Folder map. - Architecture/coding rules. - Security/privacy rules. - AI
provider rules. - Build/test commands. - Documentation update rules. -
Git safety. - Quy tắc không bịa trạng thái implementation.

### CLAUDE.md

File riêng cho Claude Code: - Yêu cầu đọc `AGENTS.md`. - Đọc docs theo
task, không đọc toàn bộ repo một cách máy móc. - Không sửa file ngoài
scope. - Hỏi trước khi thêm dependency lớn hoặc đổi kiến trúc. - Không
duplicate nội dung architecture docs.

### Local instructions

Chỉ thêm `apps/mobile/AGENTS.md` hoặc `apps/backend/AGENTS.md` nếu
module có conventions riêng đáng kể. Tránh lặp hướng dẫn root.

### Task-driven workflow

Mỗi task là GitHub Issue hoặc Markdown file, gồm: - Objective -
Context - Requirements - Out of scope - Acceptance criteria - Relevant
docs/files - Test commands - Implementation notes

Agent phải: 1. Đọc root instructions. 2. Đọc task. 3. Chỉ inspect
code/docs liên quan. 4. Nêu assumptions/blockers. 5. Lập plan ngắn nếu
task nhiều bước. 6. Implement đúng scope. 7. Viết/cập nhật tests. 8.
Chạy test liên quan. 9. Cập nhật API/architecture docs nếu thay đổi. 10.
Báo cáo files, tests và phần chưa hoàn thành.

### Git and multi-agent safety

-   Không cho hai agent cùng sửa một file/branch đồng thời.
-   Chia task theo module/file ownership.
-   Dùng branch riêng cho feature/task.
-   Review `git diff` trước merge.
-   Không tự commit/push/merge nếu chưa được yêu cầu.
-   Không xóa/ghi đè thay đổi chưa commit của người dùng.
-   Nếu working tree có thay đổi, giữ nguyên thay đổi ngoài scope.

## 7. Required root files

### AGENTS.md

Tạo ngắn gọn dựa trên tài liệu này. Bắt buộc có product scope,
repository map, mobile/backend rules, security/privacy, AI provider
rules, test commands, documentation/OpenAPI rules, Git safety và rule
không bịa implementation status. Không copy toàn bộ architecture docs
vào đây.

### CLAUDE.md

Ngắn gọn: - Read `AGENTS.md` first. - Read only relevant docs. - Do not
duplicate architecture documentation. - Do not modify unrelated files. -
Ask before major dependency/architecture changes. - Run relevant tests
and report exact results.

### README.md

Phải có: - Rewind overview. - MVP features. - Technology stack. -
Repository structure. - Prerequisites. - Run mobile locally. - Run
backend locally. - Environment setup link to `.env.example`. - Test
commands. - Links tới product, architecture, API, implementation docs. -
Current project status.

Không ghi app đã có feature nếu mới chỉ có skeleton.

## 8. Documentation to create

Tạo các file có nội dung khởi đầu hữu ích, không để placeholder chung
chung:

  -----------------------------------------------------------------------------------------------------------------
  File                                                Nội dung
  --------------------------------------------------- -------------------------------------------------------------
  `docs/product/PRODUCT_OVERVIEW.md`                  Problem, users, use cases, MVP scope, out of scope

  `docs/architecture/SYSTEM_ARCHITECTURE.md`          Components, data flow, deployment boundaries

  `docs/architecture/MOBILE_ARCHITECTURE.md`          Feature structure, navigation, API/state conventions

  `docs/architecture/BACKEND_ARCHITECTURE.md`         Modular monolith, module boundaries, layers

  `docs/architecture/AI_PIPELINE.md`                  Capture/upload/OCR/vision/extraction/embedding/status/error
                                                      flow

  `docs/architecture/DATABASE_DESIGN.md`              Proposed entities, relations, indexes; label as proposed

  `docs/api/openapi.yaml`                             Initial API contract; only define understood endpoints

  `docs/implementation/TECHNICAL_IMPLEMENTATION.md`   Tech choices, setup, implementation notes

  `docs/implementation/ROADMAP.md`                    Milestones and dependency order

  `docs/decisions/README.md`                          ADR workflow

  `docs/decisions/ADR-0001-monorepo.md`               Why monorepo, alternatives, trade-offs

  `docs/tasks/README.md`                              Task workflow and template

  `docs/tasks/TASK_TEMPLATE.md`                       Reusable task template
  -----------------------------------------------------------------------------------------------------------------

ADR template:

``` markdown
# ADR-NNNN: <Decision title>
- Status: Proposed | Accepted | Superseded
- Date: YYYY-MM-DD
- Decision owners: <team>

## Context
Why is a decision needed?

## Options
What alternatives were considered?

## Decision
What was selected?

## Consequences
Benefits, trade-offs, migration implications.

## Follow-up
What needs to be implemented or revisited?
```

Task template:

``` markdown
# <TASK-ID>: <Task title>

## Status
Proposed | Ready | In Progress | Review | Done

## Objective
What outcome should this task deliver?

## Context
Relevant product and technical context.

## Requirements
- [ ] Requirement 1

## Out of scope
- Explicit exclusions.

## Acceptance criteria
- [ ] Observable criterion 1

## Relevant files and docs
- `path/to/file`

## Test plan
- Tests to add or run.

## Implementation notes
Update after implementation.

## Open questions
- Questions requiring a decision.
```

## 9. Initial implementation roadmap

Đây là thứ tự đề xuất, không implement trong bootstrap task:

### Phase 0 --- Repository foundation

Monorepo, mobile skeleton, backend skeleton, root instructions/docs, CI
basic build/test.

### Phase 1 --- First vertical slice

Mobile capture/import, backend upload API, object storage, media
metadata persistence, user views uploaded image.

### Phase 2 --- OCR

On-device OCR integration, OCR result API/persistence, status/failure
handling, display extracted text.

### Phase 3 --- AI extraction

Vision provider adapter, structured output schema,
validation/normalization, evidence linkage, user edits.

### Phase 4 --- Library and keyword search

Image list/detail, tags/categories, keyword search, delete/retry.

### Phase 5 --- Semantic search

Embedding provider, pgvector, similarity search, hybrid search if
needed, results link to source images.

### Phase 6 --- Release readiness

Privacy/account deletion, security review, device permission review,
performance/crash testing, Android App Bundle and Play Console
preparation.

## 10. Security and privacy baseline

-   Never commit `.env`, credentials, service-role keys, signing keys or
    private certificates.
-   `.env.example` contains names and safe placeholders only.
-   Backend validates ownership for every user-specific resource.
-   Storage objects are private by default.
-   Do not log raw images, access tokens, passwords or sensitive
    extracted text.
-   Define deletion/retention for images, OCR, AI outputs and
    embeddings.
-   Disclose third-party AI processing.
-   Provide account/data deletion if accounts are supported.
-   Use HTTPS in deployed environments.
-   Authorization is enforced on backend, not just by hiding UI.
-   Never use production secrets in local tests or CI logs.

## 11. Bootstrap acceptance criteria

### Repository

-   [ ] One Git repository with agreed monorepo structure.
-   [ ] `.gitignore`, `.editorconfig`, `.env.example`, `README.md`.
-   [ ] No committed secrets.
-   [ ] No unnecessary monorepo framework or microservices.

### Mobile

-   [ ] Expo React Native TypeScript app in `apps/mobile`.
-   [ ] App starts using documented command.
-   [ ] TypeScript check or available lint/test command runs.
-   [ ] Minimal placeholder screen identifies Rewind.

### Backend

-   [ ] Java 21 Spring Boot app in `apps/backend`.
-   [ ] Gradle wrapper included.
-   [ ] App starts using documented command.
-   [ ] Minimal health endpoint and test.
-   [ ] Environment-based secret/config setup.

### Agent handoff

-   [ ] Concise root `AGENTS.md`.
-   [ ] Root `CLAUDE.md` points to `AGENTS.md`.
-   [ ] README explains how a new developer/agent starts.
-   [ ] Docs in section 8 exist and are consistent.
-   [ ] ADR and task templates exist.
-   [ ] API contract clearly labels planned vs implemented endpoints.

### Verification

-   [ ] Mobile checks executed.
-   [ ] Backend tests/build executed.
-   [ ] Failed/skipped checks reported.
-   [ ] Final report lists files, commands, results and open decisions.

## 12. Prompt to give Claude Code

Mở Claude Code tại thư mục repository dự định dùng, sau đó copy prompt:

``` text
You are the technical lead responsible for bootstrapping the Rewind repository.

Read the entire REWIND_REPO_BOOTSTRAP.md file first. It is the approved bootstrap specification and primary source of product and architecture requirements.

GOAL
Create the initial Rewind monorepo and its documentation/AI-agent handoff system so Claude Code, Codex and future agents can understand and continue the project without relying on chat history.

SCOPE
This is a repository bootstrap task, NOT implementation of the complete application.

You must:
1. Inspect the current directory and Git status before changing anything.
2. Preserve existing user files and uncommitted changes.
3. Create the repository structure in the specification.
4. Initialize React Native + Expo + TypeScript under apps/mobile.
5. Initialize Java 21 + Spring Boot + Gradle under apps/backend.
6. Add a minimal mobile placeholder screen.
7. Add a minimal backend health endpoint and test.
8. Create root AGENTS.md and CLAUDE.md.
9. Create every documentation file listed in section 8.
10. Create ADR and task templates.
11. Add .gitignore, .editorconfig, .gitattributes and .env.example.
12. Add basic GitHub Actions workflows for mobile/backend checks if reliable.
13. Ensure README explains setup, run, test and where future agents should look for context.

AI AGENT HANDOFF IS A CORE REQUIREMENT
Future agents must be able to start from repository files alone.

Establish these rules:
- AGENTS.md is the general coding-agent instruction file.
- CLAUDE.md is Claude-specific and refers to AGENTS.md rather than duplicating it.
- Product scope belongs in docs/product/.
- Architecture belongs in docs/architecture/.
- API contract belongs in docs/api/openapi.yaml.
- Accepted technical decisions belong in docs/decisions/ as ADRs.
- Active work belongs in docs/tasks/ or GitHub Issues.
- Roadmap belongs in docs/implementation/ROADMAP.md.
- Chat history is not the source of truth.
- Keep documentation synchronized with code.
- Label features as implemented, planned, proposed or out of scope.

ARCHITECTURE CONSTRAINTS
- Single monorepo.
- Mobile and backend are separate applications under apps/.
- Mobile uses feature-based organization.
- Backend uses a modular monolith.
- Apply clean architecture boundaries inside backend modules where appropriate, without overengineering.
- No microservices.
- Do not add RabbitMQ, Kafka, Kubernetes, LangChain or unnecessary orchestration frameworks.
- Do not implement OCR, AI extraction or semantic search in this bootstrap task.
- Do not add dependencies unless required for the minimal working skeleton.
- Do not invent API endpoints or claim features are implemented.
- Check dependency compatibility before selecting versions.

WORK METHOD
1. Inspect environment and existing files.
2. Present a concise plan.
3. Implement bootstrap in small steps.
4. Verify mobile and backend independently.
5. Check consistency between README, AGENTS.md, CLAUDE.md and docs.
6. Review final git diff for accidental files, secrets, generated artifacts and unrelated changes.

TECHNICAL DETAILS
- Java 21.
- Include Gradle wrapper.
- TypeScript strict mode.
- Environment-based backend configuration.
- No API keys in mobile.
- `.env.example` contains safe placeholders only.
- Do not commit `.env`, build output, node_modules, Gradle caches or signing credentials.
- Use valid Java package name; if unknown use `com.rewind.app` and document that it can be renamed.
- Do not assume Expo Go supports every native module. No native OCR integration is needed for bootstrap.

DOCUMENTATION QUALITY
Do not create empty files or generic placeholder docs.
Each document must contain useful, internally consistent initial content.
Clearly label proposed designs as proposed, not implemented.
Database design may be proposed; do not create every database table yet.
OpenAPI should define only understood endpoints, such as health, or clearly label future groups as planned.

TOKEN AND CONTEXT EFFICIENCY
- Do not repeatedly print entire files or huge directory listings.
- Inspect only what is needed.
- Do not read node_modules, build, target, .gradle or generated folders.
- Prefer concise summaries and targeted diffs.
- Avoid duplicate documentation.
- Do not implement features beyond bootstrap acceptance criteria.

DEFINITION OF DONE
Use section 11 of REWIND_REPO_BOOTSTRAP.md as the acceptance checklist.
Run available mobile checks and backend tests/build.
Never claim a check passed unless it actually ran.
If a dependency, SDK, network access or local tool is unavailable, explain the blocker and leave the repository in the most complete valid state possible.

FINAL REPORT
Report:
1. Repository structure created.
2. Mobile setup/run commands.
3. Backend setup/run commands.
4. Documentation and AI-agent handoff files created.
5. Dependencies added and why.
6. Commands executed and exact test/build results.
7. Decisions requiring human approval.
8. Incomplete acceptance criteria.

Do not commit, push, publish or deploy unless explicitly asked.
Begin by inspecting the repository and proceed.
```

## 13. Prompt ngắn để các AI khác tiếp tục project

Dùng prompt này cho Codex hoặc agent khác khi bắt đầu một task:

``` text
You are working on Rewind.

1. Read AGENTS.md.
2. Read README.md for repository orientation and setup.
3. Read the task file I provide.
4. Read only architecture/API/ADR docs relevant to the task.
5. Inspect current code before proposing changes.
6. Treat code and tests as implementation state; treat ADRs and docs as approved design context.
7. Do not rely on previous chat history.
8. Do not modify files outside task scope.
9. Update relevant tests and documentation.
10. Run relevant checks and report exact results.

Task: <TASK-ID or task description>
```

### Context loading theo task

  -----------------------------------------------------------------------
  Task                                Đọc trước
  ----------------------------------- -----------------------------------
  Camera/gallery                      `AGENTS.md`, mobile architecture,
                                      mobile feature liên quan

  Upload/storage                      `AGENTS.md`, system architecture,
                                      backend architecture, API contract

  OCR                                 `AGENTS.md`, AI pipeline,
                                      mobile/backend architecture liên
                                      quan

  AI extraction                       `AGENTS.md`, AI pipeline, database
                                      design, provider ADR

  Search                              `AGENTS.md`, backend architecture,
                                      database design, API contract

  Google Play release                 `AGENTS.md`, README, release
                                      roadmap, privacy/security docs
  -----------------------------------------------------------------------

Không yêu cầu agent đọc toàn bộ tài liệu cho mọi task. Đọc root
instructions trước, sau đó chỉ load context liên quan.

## 14. Human decisions --- không tự ý quyết định

Claude có thể phân tích và đề xuất, nhưng không tự chốt các quyết định
sau: - Tên app cuối cùng, package ID và Android application ID. -
Authentication strategy và token lifecycle. - OCR hoàn toàn on-device
hay có server fallback. - Model Groq Vision và Jina embedding cụ thể. -
Storage object private trên Supabase hay provider khác. - Database
schema và retention/deletion policy cuối cùng. - Semantic search có bắt
buộc trong public release đầu tiên không. - Production hosting và kế
hoạch Google Play release.

Quyết định được chấp thuận phải ghi thành ADR và cập nhật docs liên
quan.

## Final principle

**Repository phải tự giải thích được cách tiếp tục phát triển project.**

Một agent mới cần có thể clone repository, đọc `AGENTS.md`, theo README
để setup, mở một task, đọc architecture/API docs liên quan, implement,
chạy tests và cập nhật tài liệu --- không cần cuộc hội thoại Claude ban
đầu.
