package com.rewind.app.storage.infrastructure;

import com.rewind.app.storage.domain.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.Map;

@Service
public class SupabaseStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);

    private final RestClient restClient;
    private final String supabaseUrl;
    private final String serviceRoleKey;
    private final String bucket;

    public SupabaseStorageService(
            @Value("${supabase.url:}") String supabaseUrl,
            @Value("${supabase.service-role-key:}") String serviceRoleKey,
            @Value("${supabase.storage-bucket:rewind-media}") String bucket,
            RestClient.Builder restClientBuilder) {
        this.supabaseUrl = supabaseUrl != null ? supabaseUrl.replaceAll("/$", "") : "";
        this.serviceRoleKey = serviceRoleKey != null ? serviceRoleKey : "";
        this.bucket = bucket;
        this.restClient = restClientBuilder.build();
    }

    @Override
    public String upload(String path, byte[] data, String contentType) {
        if (supabaseUrl.isBlank() || serviceRoleKey.isBlank() || supabaseUrl.contains("mock-supabase")) {
            log.warn("Supabase storage is unconfigured or mocked. Simulating storage for path: {}", path);
            return path;
        }

        String uploadUrl = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucket, path);
        log.info("Uploading object to Supabase storage: {}", uploadUrl);

        try {
            restClient.post()
                    .uri(uploadUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceRoleKey)
                    .header("apikey", serviceRoleKey)
                    .header("x-upsert", "true")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(data)
                    .retrieve()
                    .toBodilessEntity();

            log.info("Successfully uploaded object to Supabase storage at path: {}", path);
            return path;
        } catch (Exception ex) {
            log.error("Failed to upload object to Supabase storage: {}", ex.getMessage(), ex);
            throw new RuntimeException("Storage upload failed: " + ex.getMessage(), ex);
        }
    }

    @Override
    public String getSignedUrl(String path, Duration expiration) {
        if (supabaseUrl.isBlank() || serviceRoleKey.isBlank() || supabaseUrl.contains("mock-supabase")) {
            return String.format("%s/mock-storage/%s/%s", supabaseUrl, bucket, path);
        }

        String signUrl = String.format("%s/storage/v1/object/sign/%s/%s", supabaseUrl, bucket, path);
        long expiresInSeconds = expiration.toSeconds();

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri(signUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceRoleKey)
                    .header("apikey", serviceRoleKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("expiresIn", expiresInSeconds))
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("signedURL")) {
                String relativeSignedUrl = (String) response.get("signedURL");
                if (relativeSignedUrl != null && !relativeSignedUrl.startsWith("/storage/v1")) {
                    relativeSignedUrl = "/storage/v1" + (relativeSignedUrl.startsWith("/") ? "" : "/") + relativeSignedUrl;
                }
                return supabaseUrl + relativeSignedUrl;
            }

            return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + path;
        } catch (Exception ex) {
            log.error("Failed to generate signed URL from Supabase storage: {}", ex.getMessage(), ex);
            return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + path;
        }
    }
}
