package com.md_blog.demo.blog.controller;

import com.md_blog.demo.blog.dto.BlogFileContentResponse;
import com.md_blog.demo.blog.dto.BlogFileTreeResponse;
import com.md_blog.demo.blog.dto.BlogMainResponse;
import com.md_blog.demo.blog.dto.BlogRepoIdsRequest;
import com.md_blog.demo.blog.dto.BlogRepoOrderRequest;
import com.md_blog.demo.blog.service.BlogService;
import com.md_blog.demo.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/blog")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

    @GetMapping("/{username}")
    public ResponseEntity<BlogMainResponse> getBlogMain(@PathVariable String username) {
        return ResponseEntity.ok(blogService.getBlogMain(username));
    }

    @GetMapping("/{username}/file-tree")
    public ResponseEntity<List<BlogFileTreeResponse>> getBlogFileTree(@PathVariable String username) {
        return ResponseEntity.ok(blogService.getBlogFileTree(username));
    }

    @GetMapping("/{username}/file-content")
    public ResponseEntity<BlogFileContentResponse> getBlogFileContent(
            @PathVariable String username,
            @RequestParam String repoFullName,
            @RequestParam String path
    ) {
        return ResponseEntity.ok(blogService.getBlogFileContent(username, repoFullName, path));
    }

    @GetMapping("/repos")
    public ResponseEntity<Set<Long>> getBlogRepos(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(blogService.getBlogGithubRepoIds(user));
    }

    @PostMapping("/repos/add")
    public ResponseEntity<Void> addBlogRepos(
            @AuthenticationPrincipal User user,
            @RequestBody BlogRepoIdsRequest request
    ) {
        if (user == null) return ResponseEntity.status(401).build();
        blogService.addBlogRepos(user, request.githubRepoIds());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/repos/remove")
    public ResponseEntity<Void> removeBlogRepos(
            @AuthenticationPrincipal User user,
            @RequestBody BlogRepoIdsRequest request
    ) {
        if (user == null) return ResponseEntity.status(401).build();
        blogService.removeBlogRepos(user, request.githubRepoIds());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/repos/order")
    public ResponseEntity<Void> updateBlogRepoOrder(
            @AuthenticationPrincipal User user,
            @RequestBody BlogRepoOrderRequest request
    ) {
        if (user == null) return ResponseEntity.status(401).build();
        blogService.updateBlogRepoOrder(user, request.orderedGithubRepoIds());
        return ResponseEntity.ok().build();
    }
}
