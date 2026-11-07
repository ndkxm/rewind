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
        String mimeType,
        Long fileSizeBytes,
        Integer width,
        Integer height,
        Instant capturedAt,
        ProcessingStatus processingStatus,
        Instant createdAt,
        Instant updatedAt
) {
    public static MediaResponse from(Media media, String signedUrl) {
        return new MediaResponse(
                media.getId(),
                media.getUserId(),
                media.getStoragePath(),
                signedUrl,
                media.getOriginalFilename(),
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
