package com.rewind.app.media.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MediaRepository {
    Media save(Media media);
    Optional<Media> findById(UUID id);
    List<Media> findByUserId(UUID userId);
    void deleteById(UUID id);
}
