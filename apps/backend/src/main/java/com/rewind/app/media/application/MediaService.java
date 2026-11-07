package com.rewind.app.media.application;

import com.rewind.app.media.application.dto.MediaResponse;
import com.rewind.app.media.domain.Media;
import com.rewind.app.media.domain.MediaRepository;
import com.rewind.app.storage.domain.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class MediaService {

    public static final UUID DEFAULT_DEV_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final Duration SIGNED_URL_DURATION = Duration.ofHours(1);

    private final MediaRepository mediaRepository;
    private final StorageService storageService;

    public MediaService(MediaRepository mediaRepository, StorageService storageService) {
        this.mediaRepository = mediaRepository;
        this.storageService = storageService;
    }

    /**
     * Backward-compatible upload method for single media file with default AI naming.
     */
    @Transactional
    public MediaResponse uploadMedia(
            UUID userId,
            MultipartFile file,
            Integer width,
            Integer height,
            Instant capturedAt) {
        return uploadMedia(userId, file, width, height, capturedAt, null, "AI_GENERATED");
    }

    /**
     * Upload single image with explicit title or naming strategy:
     * - "KEEP_ORIGINAL": preserves physical device original filename in title
     * - "AI_GENERATED": keeps title null/pending until AI OCR & Vision pipeline generates semantic title
     */
    @Transactional
    public MediaResponse uploadMedia(
            UUID userId,
            MultipartFile file,
            Integer width,
            Integer height,
            Instant capturedAt,
            String title,
            String namingStrategy) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }

        UUID resolvedUserId = userId != null ? userId : DEFAULT_DEV_USER_ID;
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image uploads are supported. Received: " + contentType);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = extractExtension(originalFilename, contentType);
        UUID mediaId = UUID.randomUUID();
        // Storage path is always private UUID-based to prevent path traversal and naming collisions
        String storagePath = String.format("users/%s/%s%s", resolvedUserId, mediaId, extension);

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file content: " + e.getMessage(), e);
        }

        // 1. Upload to Supabase / Object Storage
        storageService.upload(storagePath, bytes, contentType);

        // 2. Resolve document title based on naming strategy
        String resolvedTitle = title;
        if (resolvedTitle == null || resolvedTitle.isBlank()) {
            if ("KEEP_ORIGINAL".equalsIgnoreCase(namingStrategy)) {
                resolvedTitle = originalFilename;
            } else {
                // AI_GENERATED: left null until AI background worker extracts and updates semantic title
                resolvedTitle = null;
            }
        }

        // 3. Persist Media Entity in PostgreSQL
        Media media = new Media(
                mediaId,
                resolvedUserId,
                storagePath,
                originalFilename,
                resolvedTitle,
                contentType,
                file.getSize(),
                width,
                height,
                capturedAt != null ? capturedAt : Instant.now(),
                null,
                Instant.now(),
                Instant.now()
        );

        Media savedMedia = mediaRepository.save(media);

        // 4. Generate signed URL for immediate mobile preview
        String signedUrl = storageService.getSignedUrl(storagePath, SIGNED_URL_DURATION);

        return MediaResponse.from(savedMedia, signedUrl);
    }

    /**
     * Bulk / Batch upload for multiple images.
     * Uploads each file, assigns titles according to namingStrategy, and returns list of created media items.
     */
    @Transactional
    public List<MediaResponse> uploadBatchMedia(
            UUID userId,
            List<MultipartFile> files,
            String namingStrategy) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("Files list must not be empty");
        }

        List<MediaResponse> results = new ArrayList<>();
        for (MultipartFile file : files) {
            results.add(uploadMedia(userId, file, null, null, null, null, namingStrategy));
        }
        return results;
    }

    @Transactional(readOnly = true)
    public List<MediaResponse> getUserMedia(UUID userId) {
        UUID resolvedUserId = userId != null ? userId : DEFAULT_DEV_USER_ID;
        return mediaRepository.findByUserId(resolvedUserId)
                .stream()
                .map(media -> {
                    String signedUrl = storageService.getSignedUrl(media.getStoragePath(), SIGNED_URL_DURATION);
                    return MediaResponse.from(media, signedUrl);
                })
                .toList();
    }

    private String extractExtension(String filename, String contentType) {
        if (filename != null && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf("."));
        }
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }
}
