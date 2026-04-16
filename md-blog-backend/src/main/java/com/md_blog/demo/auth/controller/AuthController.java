package com.md_blog.demo.auth.controller;

import com.md_blog.demo.auth.dto.UserResponse;
import com.md_blog.demo.user.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // JWT는 stateless이므로 서버에서 할 작업 없음 — 클라이언트가 토큰을 삭제
        return ResponseEntity.ok().build();
    }
}
