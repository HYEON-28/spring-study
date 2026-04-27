package com.md_blog.demo.repo.dto;

public record ConnectedRepoResponse(
        Long githubRepoId,
        String name,
        String description,
        String language,
        String htmlUrl,
        String pushedAt,
        boolean blog,
        int displayOrder
) {}
