package com.md_blog.demo.twitter.service;

import com.md_blog.demo.twitter.store.TwitterPendingAuthStore;
import com.md_blog.demo.user.entity.User;
import com.md_blog.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TwitterService {

    private static final String AUTH_BASE = "https://twitter.com";
    private static final String API_BASE = "https://api.twitter.com";

    @Value("${twitter.client-id:}")
    private String clientId;

    @Value("${twitter.client-secret:}")
    private String clientSecret;

    @Value("${twitter.redirect-uri:}")
    private String redirectUri;

    @Value("${frontend.url}")
    private String frontendUrl;

    private final UserRepository userRepository;
    private final TwitterPendingAuthStore pendingAuthStore;

    public String generateAuthUrl(UUID userId) {
        String codeVerifier = generateCodeVerifier();
        String codeChallenge = generateCodeChallenge(codeVerifier);
        String state = generateState();

        pendingAuthStore.put(state, new TwitterPendingAuthStore.PendingAuth(
                userId, codeVerifier, Instant.now().plusSeconds(600)
        ));

        return AUTH_BASE + "/i/oauth2/authorize" +
                "?response_type=code" +
                "&client_id=" + encode(clientId) +
                "&redirect_uri=" + encode(redirectUri) +
                "&scope=" + encode("tweet.write users.read offline.access") +
                "&state=" + state +
                "&code_challenge=" + codeChallenge +
                "&code_challenge_method=S256";
    }

    @Transactional
    public String handleCallback(String code, String state) {
        TwitterPendingAuthStore.PendingAuth pending = pendingAuthStore.getAndRemove(state)
                .orElseThrow(() -> new IllegalStateException("Invalid or expired state"));

        try {
            String credentials = Base64.getEncoder().encodeToString(
                    (clientId + ":" + clientSecret).getBytes(StandardCharsets.UTF_8));

            RestClient tokenClient = RestClient.builder()
                    .baseUrl(API_BASE)
                    .defaultHeader("Authorization", "Basic " + credentials)
                    .build();

            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("grant_type", "authorization_code");
            form.add("code", code);
            form.add("redirect_uri", redirectUri);
            form.add("code_verifier", pending.codeVerifier());

            Map<String, Object> tokenResponse = tokenClient.post()
                    .uri("/2/oauth2/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (tokenResponse == null) throw new RuntimeException("Empty token response");

            String accessToken = (String) tokenResponse.get("access_token");
            String refreshToken = (String) tokenResponse.get("refresh_token");

            RestClient apiClient = RestClient.builder()
                    .baseUrl(API_BASE)
                    .defaultHeader("Authorization", "Bearer " + accessToken)
                    .build();

            Map<String, Object> meResponse = apiClient.get()
                    .uri("/2/users/me")
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (meResponse == null) throw new RuntimeException("Empty user info response");

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) meResponse.get("data");
            String twitterId = (String) data.get("id");
            String twitterUsername = (String) data.get("username");

            User user = userRepository.findById(pending.userId())
                    .orElseThrow(() -> new IllegalStateException("User not found"));
            user.connectTwitter(twitterId, twitterUsername, accessToken, refreshToken);
            userRepository.save(user);

            return frontendUrl + "/learning-summary?twitterLinked=true";
        } catch (Exception e) {
            log.error("Twitter callback failed", e);
            return frontendUrl + "/learning-summary?twitterError=true";
        }
    }

    @Transactional
    public void postTweet(User user, String text) {
        if (!user.isTwitterConnected()) {
            throw new IllegalStateException("Twitter not connected");
        }

        String accessToken = user.getTwitterAccessToken();
        try {
            doPostTweet(accessToken, text);
        } catch (TwitterAuthExpiredException e) {
            if (user.getTwitterRefreshToken() != null) {
                accessToken = refreshAccessToken(user);
                doPostTweet(accessToken, text);
            } else {
                user.disconnectTwitter();
                userRepository.save(user);
                throw new IllegalStateException("TWITTER_RECONNECT_REQUIRED");
            }
        }
    }

    private void doPostTweet(String accessToken, String text) {
        RestClient client = RestClient.builder()
                .baseUrl(API_BASE)
                .defaultHeader("Authorization", "Bearer " + accessToken)
                .build();

        try {
            client.post()
                    .uri("/2/tweets")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("text", text))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "";
            if (msg.contains("401") || msg.contains("Unauthorized")) {
                throw new TwitterAuthExpiredException();
            }
            throw new RuntimeException("Tweet posting failed: " + msg, e);
        }
    }

    private String refreshAccessToken(User user) {
        String credentials = Base64.getEncoder().encodeToString(
                (clientId + ":" + clientSecret).getBytes(StandardCharsets.UTF_8));

        RestClient tokenClient = RestClient.builder()
                .baseUrl(API_BASE)
                .defaultHeader("Authorization", "Basic " + credentials)
                .build();

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "refresh_token");
        form.add("refresh_token", user.getTwitterRefreshToken());

        try {
            Map<String, Object> tokenResponse = tokenClient.post()
                    .uri("/2/oauth2/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (tokenResponse == null) throw new RuntimeException("Empty refresh response");

            String newAccessToken = (String) tokenResponse.get("access_token");
            String newRefreshToken = tokenResponse.containsKey("refresh_token")
                    ? (String) tokenResponse.get("refresh_token")
                    : user.getTwitterRefreshToken();

            user.connectTwitter(user.getTwitterId(), user.getTwitterUsername(), newAccessToken, newRefreshToken);
            userRepository.save(user);
            return newAccessToken;
        } catch (Exception e) {
            user.disconnectTwitter();
            userRepository.save(user);
            throw new IllegalStateException("TWITTER_RECONNECT_REQUIRED");
        }
    }

    private String generateCodeVerifier() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String generateCodeChallenge(String verifier) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(verifier.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    private String generateState() {
        byte[] bytes = new byte[16];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private static class TwitterAuthExpiredException extends RuntimeException {
        TwitterAuthExpiredException() { super("Twitter token expired"); }
    }
}
