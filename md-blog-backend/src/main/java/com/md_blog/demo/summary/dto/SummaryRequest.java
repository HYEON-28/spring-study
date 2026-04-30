package com.md_blog.demo.summary.dto;

import java.util.List;

public record SummaryRequest(
        List<String> repoFullNames,
        String customPrompt
) {}
