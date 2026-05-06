package com.md_blog.demo.twitter.controller;

import com.md_blog.demo.twitter.dto.TweetRequest;
import com.md_blog.demo.twitter.service.TwitterService;
import com.md_blog.demo.user.entity.User;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/twitter")
@RequiredArgsConstructor
public class TwitterController {

    private static final String PENDING_COOKIE = "twitter_pending_auth";

    private final TwitterService twitterService;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @GetMapping("/auth-url")
    public ResponseEntity<Map<String, String>> getAuthUrl(
            @AuthenticationPrincipal User user,
            HttpServletResponse response
    ) {
        if (user == null) return ResponseEntity.status(401).build();

        TwitterService.AuthUrlResult result = twitterService.generateAuthUrl(user.getId());

        ResponseCookie cookie = ResponseCookie.from(PENDING_COOKIE, result.cookiePayload())
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/api/twitter/callback")
                .maxAge(600)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(Map.of("authUrl", result.authUrl()));
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> callback(
            @RequestParam String code,
            @RequestParam String state,
            @CookieValue(name = PENDING_COOKIE, required = false) String cookiePayload
    ) {
        String redirectUrl = twitterService.handleCallback(code, state, cookiePayload);
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
            if ("TWITTER_QUOTA_EXCEEDED".equals(e.getMessage())) {
                return ResponseEntity.status(402).body(Map.of("error", "TWITTER_QUOTA_EXCEEDED"));
            }
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(502).body(Map.of("error", e.getMessage()));
        }
    }
}
