package com.md_blog.demo.twitter.controller;

import com.md_blog.demo.twitter.dto.TweetRequest;
import com.md_blog.demo.twitter.service.TwitterService;
import com.md_blog.demo.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/twitter")
@RequiredArgsConstructor
public class TwitterController {

    private final TwitterService twitterService;

    @GetMapping("/auth-url")
    public ResponseEntity<Map<String, String>> getAuthUrl(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        String authUrl = twitterService.generateAuthUrl(user.getId());
        return ResponseEntity.ok(Map.of("authUrl", authUrl));
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> callback(
            @RequestParam String code,
            @RequestParam String state
    ) {
        String redirectUrl = twitterService.handleCallback(code, state);
        return ResponseEntity.status(302).location(URI.create(redirectUrl)).build();
    }

    @PostMapping("/tweet")
    public ResponseEntity<Map<String, String>> tweet(
            @AuthenticationPrincipal User user,
            @RequestBody TweetRequest request
    ) {
        if (user == null) return ResponseEntity.status(401).build();
        try {
            twitterService.postTweet(user, request.text());
            return ResponseEntity.ok(Map.of("status", "ok"));
        } catch (IllegalStateException e) {
            if ("TWITTER_RECONNECT_REQUIRED".equals(e.getMessage())) {
                return ResponseEntity.status(401).body(Map.of("error", "TWITTER_RECONNECT_REQUIRED"));
            }
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }
}
