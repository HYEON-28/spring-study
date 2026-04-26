package com.md_blog.demo.blog.dto;

import java.util.List;

public record BlogMainResponse(
        String username,
        String name,
        String avatarUrl,
        List<BlogRepoResponse> repos
) {}
