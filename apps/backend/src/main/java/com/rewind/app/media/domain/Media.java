package com.rewind.app.media.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "media")
public class Media {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "storage_path", nullable = false, length = 500)
    private String storagePath;

    @Column(name = "original_filename", length = 255)
    private String originalFilename;

    /**
     * User-facing display title.
     * Can be set to originalFilename (KEEP_ORIGINAL) or populated by AI vision/OCR extraction (AI_GENERATED).
     */
    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "mime_type", nullable = false, length = 50)
    private String mimeType;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "width")
    private Integer width;

    @Column(name = "height")
    private Integer height;

    @Column(name = "captured_at")
    private Instant capturedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "processing_status", nullable = false, length = 30)
    private ProcessingStatus processingStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Media() {
        // JPA requirement
    }

    public Media(
            UUID id,
            UUID userId,
            String storagePath,
            String originalFilename,
            String title,
            String mimeType,
            Long fileSizeBytes,
            Integer width,
            Integer height,
            Instant capturedAt,
            ProcessingStatus processingStatus,
            Instant createdAt,
            Instant updatedAt) {
        this.id = Objects.requireNonNull(id, "id must not be null");
        this.userId = Objects.requireNonNull(userId, "userId must not be null");
        this.storagePath = Objects.requireNonNull(storagePath, "storagePath must not be null");
        this.originalFilename = originalFilename;
        this.title = title;
        this.mimeType = Objects.requireNonNull(mimeType, "mimeType must not be null");
        this.fileSizeBytes = Objects.requireNonNull(fileSizeBytes, "fileSizeBytes must not be null");
        this.width = width;
        this.height = height;
        this.capturedAt = capturedAt;
        this.processingStatus = Objects.requireNonNullElse(processingStatus, ProcessingStatus.UPLOADED);
        this.createdAt = Objects.requireNonNullElseGet(createdAt, Instant::now);
        this.updatedAt = Objects.requireNonNullElseGet(updatedAt, Instant::now);
    }

    public Media(
            UUID id,
            UUID userId,
            String storagePath,
            String originalFilename,
            String mimeType,
            Long fileSizeBytes,
            Integer width,
            Integer height,
            Instant capturedAt,
            ProcessingStatus processingStatus,
            Instant createdAt,
            Instant updatedAt) {
        this(id, userId, storagePath, originalFilename, null, mimeType, fileSizeBytes, width, height, capturedAt, processingStatus, createdAt, updatedAt);
    }

    public static Media create(
            UUID userId,
            String storagePath,
            String originalFilename,
            String title,
            String mimeType,
            Long fileSizeBytes,
            Integer width,
            Integer height,
            Instant capturedAt) {
        Instant now = Instant.now();
        return new Media(
                UUID.randomUUID(),
                userId,
                storagePath,
                originalFilename,
                title,
                mimeType,
                fileSizeBytes,
                width,
                height,
                capturedAt,
                ProcessingStatus.UPLOADED,
                now,
                now
        );
    }

    public static Media create(
            UUID userId,
            String storagePath,
            String originalFilename,
            String mimeType,
            Long fileSizeBytes,
            Integer width,
            Integer height,
            Instant capturedAt) {
        return create(userId, storagePath, originalFilename, null, mimeType, fileSizeBytes, width, height, capturedAt);
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public String getTitle() {
        return title;
    }

    public void updateTitle(String title) {
        this.title = title;
        this.updatedAt = Instant.now();
    }

    public String getMimeType() {
        return mimeType;
    }

    public Long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public Integer getWidth() {
        return width;
    }

    public Integer getHeight() {
        return height;
    }

    public Instant getCapturedAt() {
        return capturedAt;
    }

    public ProcessingStatus getProcessingStatus() {
        return processingStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void updateProcessingStatus(ProcessingStatus status) {
        this.processingStatus = status;
        this.updatedAt = Instant.now();
    }
}
