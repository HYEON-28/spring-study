package com.md_blog.demo.summary.controller;

import com.md_blog.demo.summary.dto.SummaryRequest;
import com.md_blog.demo.summary.dto.SummaryResponse;
import com.md_blog.demo.summary.service.SummaryService;
import com.md_blog.demo.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/summary")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    @PostMapping("/today")
    public ResponseEntity<SummaryResponse> summarizeToday(
            @AuthenticationPrincipal User user,
            @RequestBody SummaryRequest request
    ) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(summaryService.summarize(user, request));
    }
}
