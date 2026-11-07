package com.rewind.app.media.infrastructure;

import com.rewind.app.media.domain.Media;
import com.rewind.app.media.domain.MediaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class MediaRepositoryImpl implements MediaRepository {

    private final MediaJpaRepository jpaRepository;

    public MediaRepositoryImpl(MediaJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Media save(Media media) {
        return jpaRepository.save(media);
    }

    @Override
    public Optional<Media> findById(UUID id) {
        return jpaRepository.findById(id);
    }

    @Override
    public List<Media> findByUserId(UUID userId) {
        return jpaRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
}
