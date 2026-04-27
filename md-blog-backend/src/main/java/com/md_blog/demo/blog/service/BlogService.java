package com.md_blog.demo.blog.service;

import com.md_blog.demo.blog.dto.BlogMainResponse;
import com.md_blog.demo.blog.dto.BlogRepoResponse;
import com.md_blog.demo.blog.entity.BlogRepositoryEntity;
import com.md_blog.demo.blog.repository.BlogRepositoryJpaRepository;
import com.md_blog.demo.repo.entity.RepositoryEntity;
import com.md_blog.demo.repo.entity.RepositorySnapshotEntity;
import com.md_blog.demo.repo.repository.RepositoryJpaRepository;
import com.md_blog.demo.repo.repository.RepositorySnapshotJpaRepository;
import com.md_blog.demo.repo.service.GithubApiService;
import com.md_blog.demo.user.entity.User;
import com.md_blog.demo.user.entity.UserRepositoryEntity;
import com.md_blog.demo.user.repository.UserRepository;
import com.md_blog.demo.user.repository.UserRepositoryJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BlogService {

    private final BlogRepositoryJpaRepository blogRepositoryJpaRepository;
    private final RepositoryJpaRepository repositoryJpaRepository;
    private final RepositorySnapshotJpaRepository snapshotJpaRepository;
    private final UserRepositoryJpaRepository userRepositoryJpaRepository;
    private final UserRepository userRepository;
    private final GithubApiService githubApiService;

    @Transactional(readOnly = true)
    public BlogMainResponse getBlogMain(String username) {
        User user = userRepository.findByGithubUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<BlogRepositoryEntity> blogRepos = blogRepositoryJpaRepository.findByUserIdAndActiveTrue(user.getId());
        if (blogRepos.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No blog found");

        // user_repositories 조회
        Set<UUID> userRepoIds = blogRepos.stream()
                .map(BlogRepositoryEntity::getUserRepositoryId)
                .collect(Collectors.toSet());
        Map<UUID, UUID> userRepoIdToRepoId = userRepositoryJpaRepository.findAllById(userRepoIds).stream()
                .collect(Collectors.toMap(UserRepositoryEntity::getId, UserRepositoryEntity::getRepositoryId));

        // repositories 조회
        Map<UUID, RepositoryEntity> repoById = repositoryJpaRepository
                .findAllById(new HashSet<>(userRepoIdToRepoId.values())).stream()
                .collect(Collectors.toMap(RepositoryEntity::getId, r -> r));

        String token = user.getAccessToken();
        List<BlogRepoResponse> repos = blogRepos.stream()
                .map(br -> {
                    UUID repoId = userRepoIdToRepoId.get(br.getUserRepositoryId());
                    if (repoId == null) return null;
                    RepositoryEntity repo = repoById.get(repoId);
                    if (repo == null) return null;
                    String readme = githubApiService.getReadme(token, repo.getFullName());
                    return new BlogRepoResponse(
                            repo.getGithubRepoId(),
                            repo.getName(),
                            repo.getDescription(),
                            repo.getLanguage(),
                            repo.getHtmlUrl(),
                            readme
                    );
                })
                .filter(Objects::nonNull)
                .toList();

        return new BlogMainResponse(user.getGithubUsername(), user.getName(), user.getAvatarUrl(), repos);
    }

    @Transactional(readOnly = true)
    public Set<Long> getBlogGithubRepoIds(User user) {
        List<BlogRepositoryEntity> blogRepos = blogRepositoryJpaRepository.findByUserIdAndActiveTrue(user.getId());
        if (blogRepos.isEmpty()) return Set.of();

        Set<UUID> userRepoIds = blogRepos.stream()
                .map(BlogRepositoryEntity::getUserRepositoryId)
                .collect(Collectors.toSet());

        List<UserRepositoryEntity> userRepos = userRepositoryJpaRepository.findAllById(userRepoIds);
        Set<UUID> repoIds = userRepos.stream()
                .map(UserRepositoryEntity::getRepositoryId)
                .collect(Collectors.toSet());

        return repositoryJpaRepository.findAllById(repoIds).stream()
                .map(RepositoryEntity::getGithubRepoId)
                .collect(Collectors.toSet());
    }

    public void addBlogRepos(User user, List<Long> githubRepoIds) {
        List<RepositoryEntity> repos = repositoryJpaRepository.findAllByGithubRepoIdIn(githubRepoIds);

        for (RepositoryEntity repo : repos) {
            UserRepositoryEntity userRepo = userRepositoryJpaRepository
                    .findByUserIdAndRepositoryId(user.getId(), repo.getId())
                    .orElse(null);
            if (userRepo == null || !userRepo.isActive()) continue;

            RepositorySnapshotEntity snapshot = snapshotJpaRepository
                    .findByRepositoryId(repo.getId())
                    .orElseGet(() -> snapshotJpaRepository.save(
                            RepositorySnapshotEntity.builder()
                                    .repositoryId(repo.getId())
                                    .shaTree("")
                                    .mdFileCount(0)
                                    .build()
                    ));

            BlogRepositoryEntity blogRepo = blogRepositoryJpaRepository
                    .findByUserIdAndUserRepositoryId(user.getId(), userRepo.getId())
                    .orElse(null);

            if (blogRepo == null) {
                blogRepo = blogRepositoryJpaRepository.save(
                        BlogRepositoryEntity.builder()
                                .userId(user.getId())
                                .userRepositoryId(userRepo.getId())
                                .snapshotId(snapshot.getId())
                                .active(true)
                                .build()
                );
            } else {
                blogRepo.activate(snapshot.getId());
            }

        }
    }

    public void removeBlogRepos(User user, List<Long> githubRepoIds) {
        List<RepositoryEntity> repos = repositoryJpaRepository.findAllByGithubRepoIdIn(githubRepoIds);
        Set<UUID> repoIds = repos.stream().map(RepositoryEntity::getId).collect(Collectors.toSet());

        List<UserRepositoryEntity> userRepos = userRepositoryJpaRepository
                .findByUserIdAndRepositoryIdIn(user.getId(), repoIds);
        Set<UUID> userRepoIds = userRepos.stream()
                .map(UserRepositoryEntity::getId)
                .collect(Collectors.toSet());

        blogRepositoryJpaRepository
                .findByUserIdAndUserRepositoryIdIn(user.getId(), userRepoIds)
                .forEach(BlogRepositoryEntity::deactivate);
    }
}
