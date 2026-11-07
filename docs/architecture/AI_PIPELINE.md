# AI Processing Pipeline — Rewind

> **Status:** PROPOSED DESIGN. Nothing described here is implemented. This document describes the intended architecture for AI-powered image processing.

---

## Pipeline Overview

When a user captures and uploads an image, it flows through a multi-stage processing pipeline that extracts text, structured data, and semantic embeddings.

```
┌──────────┐    ┌──────────┐    ┌─────────┐    ┌───────────────┐    ┌─────────────────┐    ┌───────────┐    ┌──────────┐
│ CAPTURE  │ →  │ UPLOAD   │ →  │  OCR    │ →  │ VISION        │ →  │ STRUCTURED      │ →  │ EMBEDDING │ →  │ DISPLAY  │
│ (Mobile) │    │ (Mobile  │    │ (Back-  │    │ ANALYSIS      │    │ EXTRACTION      │    │ (Backend) │    │ (Mobile) │
│          │    │  → Back) │    │  end)   │    │ (Backend)     │    │ (Backend)       │    │           │    │          │
└──────────┘    └──────────┘    └─────────┘    └───────────────┘    └─────────────────┘    └───────────┘    └──────────┘
```

---

## Pipeline Steps

### Step 1: Capture (Mobile)

- **Responsibility:** Mobile app
- **Action:** User takes a photo using the device camera or selects an image from the gallery
- **Output:** Raw image file (JPEG/PNG)
- **Notes:** Mobile handles camera permissions, image preview, and basic quality validation (resolution, file size)

### Step 2: Upload (Mobile → Backend)

- **Responsibility:** Mobile app initiates; Backend receives and stores
- **Action:** Mobile sends image to backend via `POST /api/v1/media`. Backend validates the upload, stores the image in Supabase Storage, creates a `media` record in PostgreSQL, and creates a `processing_job` record with state `UPLOADED`.
- **Output:** Media ID, storage path, initial processing job record
- **Response to mobile:** Media ID and status `UPLOADED`

### Step 3: OCR (Backend)

- **Responsibility:** Backend
- **Action:** Backend sends the image to Groq Vision API with a prompt requesting raw text extraction (OCR). The full text content of the image is returned.
- **Input:** Image from Supabase Storage
- **Output:** Raw extracted text
- **Storage:** OCR text saved to `ocr_results` table; processing state updated to `OCR_COMPLETED`
- **Failure handling:** If OCR fails, state moves to `FAILED` with error details. Retry is possible.

### Step 4: Vision Analysis (Backend)

- **Responsibility:** Backend
- **Action:** Backend sends the image along with OCR text to Groq Vision API with a prompt requesting structured analysis — document type classification, key entity identification, and content categorization.
- **Input:** Image + OCR text
- **Output:** Document type, confidence score, identified entity types
- **Storage:** Analysis metadata saved; state updated to `ANALYSIS_COMPLETED`

### Step 5: Structured Extraction (Backend)

- **Responsibility:** Backend
- **Action:** Based on the document type identified in Step 4, backend sends a type-specific extraction prompt to Groq Vision. For example, a receipt prompt asks for vendor, date, total, and line items; a business card prompt asks for name, title, company, phone, and email.
- **Input:** Image + OCR text + document type
- **Output:** JSON with structured fields (varies by document type)
- **Validation:** Extracted fields are validated for type, format, and completeness before storage
- **Storage:** Structured data saved to `extractions` and `extraction_fields` tables

### Step 6: Embedding (Backend)

- **Responsibility:** Backend
- **Action:** Backend sends the extracted text (OCR + structured data summary) to Jina Embeddings API to generate a vector embedding for semantic search.
- **Input:** Concatenated text from OCR and extraction
- **Output:** Vector embedding (array of floats)
- **Storage:** Embedding stored in PostgreSQL (pgvector extension) associated with the media record; state updated to `COMPLETED`

### Step 7: Display (Mobile)

- **Responsibility:** Mobile app
- **Action:** Mobile fetches the fully processed media item via `GET /api/v1/media/{id}`, which returns the image URL, OCR text, structured data, tags, and processing status.
- **Output:** Rich media detail view showing the original image alongside all extracted information

---

## Processing States

Each media item's processing is tracked via a state machine:

```
                    ┌──────────────┐
                    │   UPLOADED   │  Image stored, processing not started
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   PENDING    │  Queued for processing
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  PROCESSING  │  Currently being processed
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │OCR_COMPLETED │  OCR text extracted successfully
                    └──────┬───────┘
                           │
              ┌────────────▼────────────┐
              │  ANALYSIS_COMPLETED     │  Vision analysis done
              └────────────┬────────────┘
                           │
                    ┌──────▼───────┐
                    │  COMPLETED   │  All processing finished
                    └──────────────┘

        (Any state)
              │
              └─────────── ┌──────────────┐
                           │    FAILED    │  Processing error (retryable)
                           └──────────────┘
```

### State Transitions

| From | To | Trigger |
|---|---|---|
| `UPLOADED` | `PENDING` | Processing job enqueued |
| `PENDING` | `PROCESSING` | Worker picks up the job |
| `PROCESSING` | `OCR_COMPLETED` | OCR extraction succeeds |
| `OCR_COMPLETED` | `ANALYSIS_COMPLETED` | Vision analysis succeeds |
| `ANALYSIS_COMPLETED` | `COMPLETED` | Structured extraction + embedding succeed |
| Any state | `FAILED` | Unrecoverable error or max retries exceeded |
| `FAILED` | `PENDING` | Manual or automatic retry triggered |

---

## Error Handling and Retry Strategy

### Retry Policy

| Scenario | Retries | Backoff | Action on Final Failure |
|---|---|---|---|
| AI provider timeout | 3 | Exponential (1s, 2s, 4s) | Mark `FAILED`, notify user |
| AI provider rate limit | 5 | Exponential with jitter | Re-enqueue with delay |
| Malformed AI response | 2 | Immediate | Mark `FAILED`, log raw response |
| Storage failure | 3 | Exponential (1s, 2s, 4s) | Mark `FAILED`, alert |
| Network error | 3 | Exponential (2s, 4s, 8s) | Mark `FAILED`, re-enqueue |

### Partial Success

Processing is designed so that partial results are usable:

- If OCR succeeds but structured extraction fails, the OCR text is still saved and searchable.
- If embedding fails, full-text search still works; only semantic search is degraded.
- The mobile app displays whatever data is available, with indicators for failed stages.

---

## LLM Output Validation Rules

All AI-generated output must be validated before storage:

1. **Schema validation:** Response must match the expected JSON schema for the extraction type. Missing required fields cause a retry.
2. **Type validation:** Extracted fields must match expected types (dates must parse as dates, numbers must parse as numbers).
3. **Length limits:** No extracted field may exceed defined maximum lengths (prevents prompt injection producing massive output).
4. **Sanitization:** HTML, script tags, and control characters are stripped from all extracted text.
5. **Confidence thresholds:** Extractions with confidence below a configurable threshold are flagged for user review rather than accepted as final.
6. **Hallucination guard:** If structured extraction returns data that has no basis in the OCR text, it is flagged or rejected.

---

## Provider Interface Pattern

AI providers are abstracted behind interfaces to enable provider swapping without business logic changes:

```java
// PROPOSED interface — not implemented

public interface VisionService {
    OcrResult extractText(byte[] image, String mimeType);
    AnalysisResult analyzeImage(byte[] image, String mimeType, String ocrText);
    ExtractionResult extractStructuredData(byte[] image, String mimeType, String ocrText, DocumentType type);
}

public interface EmbeddingService {
    float[] generateEmbedding(String text);
    List<float[]> generateEmbeddings(List<String> texts);
}

// Implementations
public class GroqVisionService implements VisionService { ... }
public class JinaEmbeddingService implements EmbeddingService { ... }
```

**Benefits:**
- Swap Groq for another vision provider (e.g., OpenAI, Claude) by implementing the interface
- Unit test business logic with mock implementations
- Run local development with stub implementations that return canned responses
