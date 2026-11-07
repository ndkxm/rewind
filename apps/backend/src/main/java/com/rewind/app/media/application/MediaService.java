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

    @Transactional
    public MediaResponse uploadMedia(
            UUID userId,
            MultipartFile file,
            Integer width,
            Integer height,
            Instant capturedAt) {
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
        String storagePath = String.format("users/%s/%s%s", resolvedUserId, mediaId, extension);

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file content: " + e.getMessage(), e);
        }

        // 1. Upload to Object Storage
        storageService.upload(storagePath, bytes, contentType);

        // 2. Persist Media Entity
        Media media = new Media(
                mediaId,
                resolvedUserId,
                storagePath,
                originalFilename,
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

        // 3. Generate signed URL for immediate preview
        String signedUrl = storageService.getSignedUrl(storagePath, SIGNED_URL_DURATION);

        return MediaResponse.from(savedMedia, signedUrl);
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
