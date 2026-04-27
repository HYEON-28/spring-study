package com.md_blog.demo.blog.dto;

import java.util.List;

public record BlogRepoOrderRequest(List<Long> orderedGithubRepoIds) {}
