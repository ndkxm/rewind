# Database Design — Rewind

> **Status:** PROPOSED — schema is not yet created. No database is provisioned. This document describes the intended data model for the PostgreSQL database.

---

## Overview

Rewind uses a single **PostgreSQL** database for all persistent data. The database stores user accounts, image metadata, OCR results, structured extractions, tags, and processing job status. Vector embeddings for semantic search will use the **pgvector** extension.

**Migration strategy:** [Flyway](https://flywaydb.org/) will manage schema migrations. Migration files will live in `apps/backend/src/main/resources/db/migration/`.

---

## Proposed Entities

### users

Stores user accounts and authentication information.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Unique user identifier |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | User email address |
| `password_hash` | `VARCHAR(255)` | NOT NULL | Bcrypt-hashed password |
| `display_name` | `VARCHAR(100)` | | User's display name |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, DEFAULT NOW() | Account creation time |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, DEFAULT NOW() | Last modification time |

### media

Stores metadata for each uploaded image. The actual image file is in Supabase Storage.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Unique media identifier |
| `user_id` | `UUID` | FK → users(id), NOT NULL | Owning user |
| `storage_path` | `VARCHAR(500)` | NOT NULL | Path in Supabase Storage |
| `original_filename` | `VARCHAR(255)` | | Original physical file name from device |
| `title` | `VARCHAR(255)` | | User-facing display title (AI-generated or original filename) |
| `mime_type` | `VARCHAR(50)` | NOT NULL | Image MIME type (e.g., image/jpeg) |
| `file_size_bytes` | `BIGINT` | NOT NULL | File size in bytes |
| `width` | `INTEGER` | | Image width in pixels |
| `height` | `INTEGER` | | Image height in pixels |
| `captured_at` | `TIMESTAMP WITH TIME ZONE` | | When the photo was taken (from EXIF) |
| `processing_status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'UPLOADED' | Current processing state |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, DEFAULT NOW() | Upload time |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, DEFAULT NOW() | Last modification time |

### ocr_results

Stores raw OCR text extracted from images.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Unique OCR result identifier |
| `media_id` | `UUID` | FK → media(id), UNIQUE, NOT NULL | Associated media item |
| `raw_text` | `TEXT` | | Full extracted text |
| `language` | `VARCHAR(10)` | | Detected language code (e.g., 'en') |
| `confidence` | `DECIMAL(5,4)` | | Overall OCR confidence (0.0–1.0) |
| `provider` | `VARCHAR(50)` | NOT NULL | AI provider used (e.g., 'groq') |
| `provider_model` | `VARCHAR(100)` | | Specific model version |
| `processing_time_ms` | `INTEGER` | | How long OCR processing took |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, DEFAULT NOW() | Extraction time |

### extractions

Stores structured data extraction results. Each media item may have one extraction record containing the document type classification and a set of extracted fields.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Unique extraction identifier |
| `media_id` | `UUID` | FK → media(id), UNIQUE, NOT NULL | Associated media item |
| `document_type` | `VARCHAR(50)` | | Classified type (receipt, business_card, etc.) |
| `document_type_confidence` | `DECIMAL(5,4)` | | Classification confidence (0.0–1.0) |
| `provider` | `VARCHAR(50)` | NOT NULL | AI provider used |
| `provider_model` | `VARCHAR(100)` | | Specific model version |
| `raw_response` | `JSONB` | | Full raw AI response (for debugging) |
| `processing_time_ms` | `INTEGER` | | How long extraction took |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, DEFAULT NOW() | Extraction time |

### extraction_fields

Stores individual extracted fields from structured data extraction. Each extraction can have multiple fields.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Unique field identifier |
| `extraction_id` | `UUID` | FK → extractions(id), NOT NULL | Parent extraction |
| `field_name` | `VARCHAR(100)` | NOT NULL | Field name (e.g., 'vendor_name', 'total_amount') |
| `field_value` | `TEXT` | | Extracted value as text |
| `field_type` | `VARCHAR(30)` | NOT NULL | Value type (string, number, date, currency, etc.) |
| `confidence` | `DECIMAL(5,4)` | | Field-level confidence (0.0–1.0) |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, DEFAULT NOW() | Creation time |

### tags

Stores the tag dictionary. Tags can be user-created or AI-suggested.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Unique tag identifier |
| `user_id` | `UUID` | FK → users(id), NOT NULL | Tag owner |
| `name` | `VARCHAR(100)` | NOT NULL | Tag display name |
| `source` | `VARCHAR(20)` | NOT NULL, DEFAULT 'user' | Origin: 'user' or 'ai' |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, DEFAULT NOW() | Creation time |

**Constraint:** UNIQUE(user_id, name) — no duplicate tag names per user.

### media_tags

Join table linking media items to tags (many-to-many).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `media_id` | `UUID` | FK → media(id), NOT NULL | Media item |
| `tag_id` | `UUID` | FK → tags(id), NOT NULL | Tag |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, DEFAULT NOW() | When the tag was applied |

**Constraint:** PK(media_id, tag_id)

### processing_jobs

Tracks the status and progress of each processing pipeline execution.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Unique job identifier |
| `media_id` | `UUID` | FK → media(id), NOT NULL | Media being processed |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'PENDING' | Job state (see AI Pipeline doc) |
| `current_step` | `VARCHAR(50)` | | Current pipeline step |
| `attempts` | `INTEGER` | NOT NULL, DEFAULT 0 | Number of processing attempts |
| `error_message` | `TEXT` | | Error details if FAILED |
| `error_code` | `VARCHAR(50)` | | Categorized error code |
| `started_at` | `TIMESTAMP WITH TIME ZONE` | | When processing began |
| `completed_at` | `TIMESTAMP WITH TIME ZONE` | | When processing finished |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, DEFAULT NOW() | Job creation time |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, DEFAULT NOW() | Last status update |

---

## Entity Relationships

```
users ──────────< media >──────── media_tags >──────── tags
  │                 │                                     │
  │                 ├─────────< ocr_results               │
  │                 │                                     │
  │                 ├─────────< extractions               │
  │                 │               │                     │
  │                 │               └───< extraction_fields│
  │                 │                                     │
  │                 └─────────< processing_jobs           │
  │                                                       │
  └───────────────────────────────────────────────────────┘
                    (tags belong to users)
```

**Relationships:**
- A **user** has many **media** items (one-to-many)
- A **user** has many **tags** (one-to-many)
- A **media** item has zero or one **ocr_result** (one-to-one)
- A **media** item has zero or one **extraction** (one-to-one)
- An **extraction** has many **extraction_fields** (one-to-many)
- A **media** item has many **tags** through **media_tags** (many-to-many)
- A **media** item has many **processing_jobs** (one-to-many, for retry tracking)

---

## Key Indexes

| Table | Index | Purpose |
|---|---|---|
| `media` | `idx_media_user_id` ON (user_id) | Look up all media for a user |
| `media` | `idx_media_user_created` ON (user_id, created_at DESC) | User's media sorted by date |
| `media` | `idx_media_processing_status` ON (processing_status) | Find items by processing state |
| `ocr_results` | `idx_ocr_media_id` ON (media_id) | Look up OCR for a media item |
| `ocr_results` | GIN index on `raw_text` | Full-text search (tsvector) |
| `extractions` | `idx_extraction_media_id` ON (media_id) | Look up extraction for a media item |
| `extraction_fields` | `idx_fields_extraction_id` ON (extraction_id) | Look up fields for an extraction |
| `extraction_fields` | `idx_fields_name_value` ON (field_name, field_value) | Search by field name/value |
| `tags` | `idx_tags_user_id` ON (user_id) | User's tags |
| `media_tags` | `idx_media_tags_tag_id` ON (tag_id) | Find media with a specific tag |
| `processing_jobs` | `idx_jobs_status` ON (status) | Find pending/failed jobs |
| `processing_jobs` | `idx_jobs_media_id` ON (media_id) | Find jobs for a media item |

---

## Full-Text Search

PostgreSQL's built-in full-text search will be used for keyword search:

```sql
-- PROPOSED — not implemented
-- Add tsvector column to ocr_results
ALTER TABLE ocr_results ADD COLUMN text_search_vector TSVECTOR;

-- Create GIN index
CREATE INDEX idx_ocr_fulltext ON ocr_results USING GIN(text_search_vector);

-- Auto-update via trigger
CREATE TRIGGER ocr_text_search_update
  BEFORE INSERT OR UPDATE ON ocr_results
  FOR EACH ROW
  EXECUTE FUNCTION tsvector_update_trigger(text_search_vector, 'pg_catalog.english', raw_text);
```

---

## Semantic Search (pgvector)

For semantic similarity search, the pgvector extension will store embeddings:

```sql
-- PROPOSED — not implemented
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to media or a dedicated embeddings table
ALTER TABLE media ADD COLUMN embedding vector(768);  -- dimension depends on Jina model

-- Create HNSW index for approximate nearest neighbor search
CREATE INDEX idx_media_embedding ON media USING hnsw (embedding vector_cosine_ops);
```

---

## Migration Strategy

- **Tool:** Flyway
- **Location:** `apps/backend/src/main/resources/db/migration/`
- **Naming:** `V{version}__{description}.sql` (e.g., `V1__create_users_table.sql`)
- **Rules:**
  - Migrations are **immutable** once applied — never edit a migration that has run
  - Each migration must be **idempotent-safe** (use `IF NOT EXISTS` where possible)
  - Destructive changes (DROP, column removal) require a two-phase migration plan
  - All migrations are reviewed before applying to production
