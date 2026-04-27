package com.md_blog.demo.blog.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "blog_repositories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class BlogRepositoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "BINARY(16)", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", columnDefinition = "BINARY(16)", nullable = false)
    private UUID userId;

    @Column(name = "user_repository_id", columnDefinition = "BINARY(16)", nullable = false)
    private UUID userRepositoryId;

    @Column(name = "snapshot_id", columnDefinition = "BINARY(16)", nullable = false)
    private UUID snapshotId;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private int displayOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void activate(UUID snapshotId, int order) {
        this.active = true;
        this.snapshotId = snapshotId;
        this.displayOrder = order;
    }

    public void deactivate() {
        this.active = false;
    }

    public void updateOrder(int order) {
        this.displayOrder = order;
    }

}
