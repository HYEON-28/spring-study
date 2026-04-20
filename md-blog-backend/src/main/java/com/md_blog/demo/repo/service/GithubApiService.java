package com.md_blog.demo.repo.service;

import com.md_blog.demo.repo.dto.GithubRepoDto;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Set;

@Service
public class GithubApiService {

    private final RestClient restClient;

    public GithubApiService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.github.com")
                .defaultHeader("Accept", "application/vnd.github.v3+json")
                .build();
    }

    public List<GithubRepoDto> getPublicRepos(String accessToken) {
        List<GithubRepoDto.GithubApiResponse> response = restClient.get()
                .uri("/user/repos?type=public&sort=updated&per_page=100")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (response == null) return List.of();

        return response.stream()
                .filter(r -> !r.isPrivate())
                .map(GithubRepoDto::from)
                .toList();
    }

    public List<GithubRepoDto.GithubApiResponse> getReposByIds(String accessToken, Set<Long> githubRepoIds) {
        List<GithubRepoDto.GithubApiResponse> response = restClient.get()
                .uri("/user/repos?type=all&sort=pushed&per_page=100")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (response == null) return List.of();

        return response.stream()
                .filter(r -> githubRepoIds.contains(r.id()))
                .toList();
    }

    /** 오늘 00:00 UTC 이후 커밋 목록 (최대 20개) */
    public List<CommitSummary> getTodayCommits(String accessToken, String fullName, String since) {
        // fullName의 슬래시가 인코딩되지 않도록 문자열로 직접 조합
        String uri = "/repos/" + fullName + "/commits?since=" + since + "&per_page=20";
        try {
            List<CommitSummary> result = restClient.get()
                    .uri(uri)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
            return result != null ? result : List.of();
        } catch (RestClientException e) {
            return List.of();
        }
    }

    /** 특정 파일을 건드린 오늘 커밋 목록 */
    public List<CommitSummary> getFileCommits(String accessToken, String fullName, String since, String filePath) {
        try {
            List<CommitSummary> result = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/repos/" + fullName + "/commits")
                            .queryParam("since", since)
                            .queryParam("path", filePath)
                            .queryParam("per_page", 20)
                            .build())
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
            return result != null ? result : List.of();
        } catch (RestClientException e) {
            return List.of();
        }
    }

    /** 특정 커밋의 파일 변경 상세 */
    public CommitDetail getCommitDetail(String accessToken, String fullName, String sha) {
        String uri = "/repos/" + fullName + "/commits/" + sha;
        try {
            return restClient.get()
                    .uri(uri)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(CommitDetail.class);
        } catch (RestClientException e) {
            return null;
        }
    }

    // ── GitHub API 응답 모델 ──────────────────────────────────────────────────

    public record CommitSummary(
            String sha,
            CommitInfo commit
    ) {
        public record CommitInfo(
                String message,
                Author author
        ) {}
        public record Author(String date) {}
    }

    public record CommitDetail(
            String sha,
            CommitInfo commit,
            List<FileChange> files
    ) {
        public record CommitInfo(
                String message,
                Author author
        ) {}
        public record Author(String date) {}
        public record FileChange(
                String filename,
                String status,
                int additions,
                int deletions,
                String patch
        ) {}
    }
}
