package com.example.demo.dto.response;

import com.example.demo.domain.command.User;

public record UserResponse (
        Long id,
        String name,
        String email
) {
    // Entity → DTO 변환 책임
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }
}