package com.rewind.app.storage.domain;

import java.time.Duration;

public interface StorageService {

    /**
     * Uploads a file to object storage at the designated path.
     *
     * @param path        Relative path/key in the storage bucket.
     * @param data        Raw file bytes.
     * @param contentType MIME type of the file.
     * @return The storage path where the file was saved.
     */
    String upload(String path, byte[] data, String contentType);

    /**
     * Generates a pre-signed temporary URL for accessing the private object.
     *
     * @param path       Relative path/key in the storage bucket.
     * @param expiration Duration for which the signed URL is valid.
     * @return The temporary signed URL.
     */
    String getSignedUrl(String path, Duration expiration);
}
