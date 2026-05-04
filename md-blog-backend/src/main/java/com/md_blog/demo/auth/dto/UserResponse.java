package com.md_blog.demo.auth.dto;

import com.md_blog.demo.user.entity.User;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String githubUsername,
        String name,
        String email,
        String avatarUrl,
        String githubProfileUrl,
        boolean twitterConnected
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getGithubUsername(),
                user.getName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getGithubProfileUrl(),
                user.isTwitterConnected()
        );
    }
}
