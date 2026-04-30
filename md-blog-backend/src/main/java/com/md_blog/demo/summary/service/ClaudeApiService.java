package com.md_blog.demo.summary.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ClaudeApiService {

    private static final String CLAUDE_API_URL = "https://api.anthropic.com";
    private static final String MODEL = "claude-haiku-4-5-20251001";
    private static final String ANTHROPIC_VERSION = "2023-06-01";

    private final RestClient restClient;

    public ClaudeApiService(@Value("${anthropic.api.key}") String apiKey) {
        this.restClient = RestClient.builder()
                .baseUrl(CLAUDE_API_URL)
                .defaultHeader("x-api-key", apiKey)
                .defaultHeader("anthropic-version", ANTHROPIC_VERSION)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public String complete(String userMessage) {
        Map<String, Object> body = Map.of(
                "model", MODEL,
                "max_tokens", 2048,
                "messages", List.of(
                        Map.of("role", "user", "content", userMessage)
                )
        );

        try {
            Map<String, Object> response = restClient.post()
                    .uri("/v1/messages")
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (response == null) return "요약에 실패했습니다.";

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
            if (content == null || content.isEmpty()) return "요약에 실패했습니다.";

            return (String) content.get(0).get("text");
        } catch (Exception e) {
            log.error("Claude API call failed", e);
            return "요약 중 오류가 발생했습니다: " + e.getMessage();
        }
    }
}
