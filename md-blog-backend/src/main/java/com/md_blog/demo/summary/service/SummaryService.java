package com.md_blog.demo.summary.service;

import com.md_blog.demo.repo.dto.TodayUpdateResponse;
import com.md_blog.demo.repo.service.TodayUpdateService;
import com.md_blog.demo.summary.dto.PromptResponse;
import com.md_blog.demo.summary.dto.SummaryRequest;
import com.md_blog.demo.summary.dto.SummaryResponse;
import com.md_blog.demo.user.entity.User;
import com.md_blog.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SummaryService {

    private static final String DEFAULT_PROMPT =
            "아래는 오늘 내가 작업한 GitHub 레포지토리의 변경 내역입니다.\n" +
            "이를 바탕으로 오늘 내가 학습하거나 작업한 내용을 한국어로 요약해주세요.\n" +
            "핵심 개념, 구현한 기능, 해결한 문제 등을 중심으로 트위터 글자제한 280자에 맞추어서 작성해주세요.\n\n";

    private final TodayUpdateService todayUpdateService;
    private final ClaudeApiService claudeApiService;
    private final UserRepository userRepository;

    public PromptResponse getCustomPrompt(User user) {
        return new PromptResponse(user.getSummaryPrompt());
    }

    @Transactional
    public void saveCustomPrompt(User user, String prompt) {
        user.updateSummaryPrompt(prompt != null ? prompt.trim() : null);
        userRepository.save(user);
    }

    public SummaryResponse summarize(User user, SummaryRequest request) {
        List<TodayUpdateResponse> allUpdates = todayUpdateService.getTodayUpdates(user);

        Set<String> selected = request.repoFullNames() != null
                ? Set.copyOf(request.repoFullNames())
                : Set.of();

        List<TodayUpdateResponse> filtered = allUpdates.stream()
                .filter(u -> selected.contains(u.repoFullName()))
                .toList();

        if (filtered.isEmpty()) {
            return new SummaryResponse("선택된 레포지토리에서 오늘의 변경 내역을 찾을 수 없습니다.");
        }

        String context = buildContext(filtered);
        String prompt = resolvePrompt(request.customPrompt()) + context;
        String summary = claudeApiService.complete(prompt);

        if (request.customPrompt() != null && !request.customPrompt().isBlank()) {
            saveCustomPrompt(user, request.customPrompt());
        }

        return new SummaryResponse(summary);
    }

    private String buildContext(List<TodayUpdateResponse> updates) {
        StringBuilder sb = new StringBuilder();
        for (TodayUpdateResponse repo : updates) {
            sb.append("## 레포지토리: ").append(repo.repoFullName());
            if (repo.language() != null) {
                sb.append(" (").append(repo.language()).append(")");
            }
            sb.append("\n");
            sb.append("- 총 추가: +").append(repo.totalAdd())
              .append(" / 삭제: -").append(repo.totalDel()).append("\n");
            sb.append("### 변경된 파일 목록\n");
            for (TodayUpdateResponse.FileChange f : repo.files()) {
                sb.append("- [").append(f.changeType()).append("] ")
                  .append(f.filePath())
                  .append(" (+").append(f.additions()).append("/-").append(f.deletions()).append(")")
                  .append(" - ").append(f.commitMessage())
                  .append("\n");
            }
            sb.append("\n");
        }
        return sb.toString();
    }

    private String resolvePrompt(String customPrompt) {
        if (customPrompt != null && !customPrompt.isBlank()) {
            return customPrompt.trim() + "\n\n";
        }
        return DEFAULT_PROMPT;
    }
}
