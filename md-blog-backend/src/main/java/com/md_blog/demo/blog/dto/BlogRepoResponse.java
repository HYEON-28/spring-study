package com.md_blog.demo.blog.dto;

public record BlogRepoResponse(
        Long githubRepoId,
        String name,
        String description,
        String language,
        String htmlUrl
) {}
