package com.md_blog.demo.twitter.store;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TwitterPendingAuthStore {

    private final Map<String, PendingAuth> store = new ConcurrentHashMap<>();

    public void put(String state, PendingAuth auth) {
        store.values().removeIf(a -> a.expiresAt().isBefore(Instant.now()));
        store.put(state, auth);
    }

    public Optional<PendingAuth> getAndRemove(String state) {
        PendingAuth auth = store.remove(state);
        if (auth == null || auth.expiresAt().isBefore(Instant.now())) {
            return Optional.empty();
        }
        return Optional.of(auth);
    }

    public record PendingAuth(UUID userId, String codeVerifier, Instant expiresAt) {}
}
