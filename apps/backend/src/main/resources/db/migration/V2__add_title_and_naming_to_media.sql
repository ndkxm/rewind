-- V2: Add title column to media table to support user-facing document naming
-- This allows distinguishing between:
-- 1. storage_path: UUID-based secure path in Supabase Storage
-- 2. original_filename: Raw physical filename from the client device (e.g. IMG_20261107_1234.jpg)
-- 3. title: User-facing display title (either AI-generated after OCR/vision or preserved from original filename)

ALTER TABLE media ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- Index for searching documents by title
CREATE INDEX IF NOT EXISTS idx_media_title ON media(title);
