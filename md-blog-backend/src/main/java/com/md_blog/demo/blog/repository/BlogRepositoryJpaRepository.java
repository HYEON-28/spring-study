package com.md_blog.demo.blog.repository;

import com.md_blog.demo.blog.entity.BlogRepositoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BlogRepositoryJpaRepository extends JpaRepository<BlogRepositoryEntity, UUID> {
    List<BlogRepositoryEntity> findByUserIdAndActiveTrue(UUID userId);
    List<BlogRepositoryEntity> findByUserIdAndActiveTrueOrderByDisplayOrderAsc(UUID userId);
    Optional<BlogRepositoryEntity> findByUserIdAndUserRepositoryId(UUID userId, UUID userRepositoryId);
    List<BlogRepositoryEntity> findByUserIdAndUserRepositoryIdIn(UUID userId, Collection<UUID> userRepositoryIds);
}
