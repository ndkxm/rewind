package com.rewind.app.media.presentation;

import com.rewind.app.media.application.MediaService;
import com.rewind.app.media.application.dto.MediaResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/media")
@CrossOrigin(origins = "*")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    /**
     * Upload a single image file.
     * Supports optional namingStrategy ("AI_GENERATED" or "KEEP_ORIGINAL") or custom title.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MediaResponse> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "width", required = false) Integer width,
            @RequestParam(value = "height", required = false) Integer height,
            @RequestParam(value = "capturedAt", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant capturedAt,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "namingStrategy", required = false, defaultValue = "AI_GENERATED") String namingStrategy,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        MediaResponse response = mediaService.uploadMedia(userId, file, width, height, capturedAt, title, namingStrategy);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Upload multiple image files at once (Bulk / Batch Upload).
     * Accepts a list of files and applies namingStrategy to all items.
     */
    @PostMapping(value = "/batch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<MediaResponse>> uploadBatchMedia(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "namingStrategy", required = false, defaultValue = "AI_GENERATED") String namingStrategy,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        List<MediaResponse> responses = mediaService.uploadBatchMedia(userId, files, namingStrategy);
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }

    @GetMapping
    public ResponseEntity<List<MediaResponse>> getUserMedia(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        List<MediaResponse> list = mediaService.getUserMedia(userId);
        return ResponseEntity.ok(list);
    }
}
