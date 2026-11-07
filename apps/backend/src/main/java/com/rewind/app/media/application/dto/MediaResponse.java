package com.rewind.app.media.application.dto;

import com.rewind.app.media.domain.Media;
import com.rewind.app.media.domain.ProcessingStatus;

import java.time.Instant;
import java.util.UUID;

public record MediaResponse(
        UUID id,
        UUID userId,
        String storagePath,
        String signedUrl,
        String originalFilename,
        String title,
        String mimeType,
        Long fileSizeBytes,
        Integer width,
        Integer height,
        Instant capturedAt,
        ProcessingStatus processingStatus,
        Instant createdAt,
        Instant updatedAt
) {
    /**
     * Backward-compatible constructor for existing tests and callers without explicit title.
     */
    public MediaResponse(
            UUID id,
            UUID userId,
            String storagePath,
            String signedUrl,
            String originalFilename,
            String mimeType,
            Long fileSizeBytes,
            Integer width,
            Integer height,
            Instant capturedAt,
            ProcessingStatus processingStatus,
            Instant createdAt,
            Instant updatedAt
    ) {
        this(
                id,
                userId,
                storagePath,
                signedUrl,
                originalFilename,
                originalFilename,
                mimeType,
                fileSizeBytes,
                width,
                height,
                capturedAt,
                processingStatus,
                createdAt,
                updatedAt
        );
    }

    public static MediaResponse from(Media media, String signedUrl) {
        return new MediaResponse(
                media.getId(),
                media.getUserId(),
                media.getStoragePath(),
                signedUrl,
                media.getOriginalFilename(),
                media.getTitle(),
                media.getMimeType(),
                media.getFileSizeBytes(),
                media.getWidth(),
                media.getHeight(),
                media.getCapturedAt(),
                media.getProcessingStatus(),
                media.getCreatedAt(),
                media.getUpdatedAt()
        );
    }
}
