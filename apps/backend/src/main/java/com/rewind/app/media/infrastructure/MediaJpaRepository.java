package com.rewind.app.media.infrastructure;

import com.rewind.app.media.domain.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MediaJpaRepository extends JpaRepository<Media, UUID> {
    List<Media> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
