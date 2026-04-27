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
import com.md_blog.demo.blog.dto.BlogFileContentResponse;
import com.md_blog.demo.blog.dto.BlogFileTreeResponse;

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

        List<BlogRepositoryEntity> blogRepos = blogRepositoryJpaRepository.findByUserIdAndActiveTrueOrderByDisplayOrderAsc(user.getId());
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

    @Transactional(readOnly = true)
    public List<BlogFileTreeResponse> getBlogFileTree(String username) {
        User user = userRepository.findByGithubUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<BlogRepositoryEntity> blogRepos = blogRepositoryJpaRepository.findByUserIdAndActiveTrueOrderByDisplayOrderAsc(user.getId());
        if (blogRepos.isEmpty()) return List.of();

        Set<UUID> userRepoIds = blogRepos.stream()
                .map(BlogRepositoryEntity::getUserRepositoryId)
                .collect(Collectors.toSet());
        Map<UUID, UUID> userRepoIdToRepoId = userRepositoryJpaRepository.findAllById(userRepoIds).stream()
                .collect(Collectors.toMap(UserRepositoryEntity::getId, UserRepositoryEntity::getRepositoryId));

        Map<UUID, RepositoryEntity> repoById = repositoryJpaRepository
                .findAllById(new HashSet<>(userRepoIdToRepoId.values())).stream()
                .collect(Collectors.toMap(RepositoryEntity::getId, r -> r));

        String token = user.getAccessToken();
        return blogRepos.stream()
                .map(br -> {
                    UUID repoId = userRepoIdToRepoId.get(br.getUserRepositoryId());
                    if (repoId == null) return null;
                    RepositoryEntity repo = repoById.get(repoId);
                    if (repo == null) return null;

                    List<GithubApiService.TreeEntry> flatFiles = githubApiService.getMdFileTree(
                            token, repo.getFullName(), repo.getDefaultBranch());
                    List<BlogFileTreeResponse.FileTreeNode> tree = buildFileTree(flatFiles);

                    return new BlogFileTreeResponse(repo.getName(), repo.getFullName(), tree);
                })
                .filter(Objects::nonNull)
                .toList();
    }

    @Transactional(readOnly = true)
    public BlogFileContentResponse getBlogFileContent(String username, String repoFullName, String filePath) {
        User user = userRepository.findByGithubUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String content = githubApiService.getFileContent(user.getAccessToken(), repoFullName, filePath);
        if (content == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");

        return new BlogFileContentResponse(filePath, content);
    }

    private List<BlogFileTreeResponse.FileTreeNode> buildFileTree(List<GithubApiService.TreeEntry> entries) {
        Map<String, BlogFileTreeResponse.FileTreeNode> folderMap = new LinkedHashMap<>();
        List<BlogFileTreeResponse.FileTreeNode> roots = new ArrayList<>();

        for (GithubApiService.TreeEntry entry : entries) {
            String[] parts = entry.path().split("/");
            List<BlogFileTreeResponse.FileTreeNode> current = roots;
            StringBuilder pathBuilder = new StringBuilder();

            for (int i = 0; i < parts.length - 1; i++) {
                if (pathBuilder.length() > 0) pathBuilder.append("/");
                pathBuilder.append(parts[i]);
                String folderKey = pathBuilder.toString();

                BlogFileTreeResponse.FileTreeNode folder = folderMap.get(folderKey);
                if (folder == null) {
                    folder = new BlogFileTreeResponse.FileTreeNode("folder", parts[i], null, new ArrayList<>());
                    folderMap.put(folderKey, folder);
                    current.add(folder);
                }
                current = folder.children();
            }

            current.add(new BlogFileTreeResponse.FileTreeNode("file", parts[parts.length - 1], entry.path(), null));
        }

        return roots;
    }

    public void addBlogRepos(User user, List<Long> githubRepoIds) {
        List<RepositoryEntity> repos = repositoryJpaRepository.findAllByGithubRepoIdIn(githubRepoIds);
        int nextOrder = blogRepositoryJpaRepository.findByUserIdAndActiveTrue(user.getId()).size();

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
                blogRepositoryJpaRepository.save(
                        BlogRepositoryEntity.builder()
                                .userId(user.getId())
                                .userRepositoryId(userRepo.getId())
                                .snapshotId(snapshot.getId())
                                .active(true)
                                .displayOrder(nextOrder++)
                                .build()
                );
            } else {
                blogRepo.activate(snapshot.getId(), nextOrder++);
            }
        }
    }

    public void updateBlogRepoOrder(User user, List<Long> orderedGithubRepoIds) {
        List<RepositoryEntity> repos = repositoryJpaRepository.findAllByGithubRepoIdIn(orderedGithubRepoIds);
        Map<Long, UUID> githubRepoIdToRepoId = repos.stream()
                .collect(Collectors.toMap(RepositoryEntity::getGithubRepoId, RepositoryEntity::getId));

        Set<UUID> repoIds = new HashSet<>(githubRepoIdToRepoId.values());
        Map<UUID, UUID> repoIdToUserRepoId = userRepositoryJpaRepository
                .findByUserIdAndRepositoryIdIn(user.getId(), repoIds).stream()
                .collect(Collectors.toMap(UserRepositoryEntity::getRepositoryId, UserRepositoryEntity::getId));

        Set<UUID> userRepoIds = new HashSet<>(repoIdToUserRepoId.values());
        Map<UUID, BlogRepositoryEntity> userRepoIdToBlogRepo = blogRepositoryJpaRepository
                .findByUserIdAndUserRepositoryIdIn(user.getId(), userRepoIds).stream()
                .filter(BlogRepositoryEntity::isActive)
                .collect(Collectors.toMap(BlogRepositoryEntity::getUserRepositoryId, br -> br));

        for (int i = 0; i < orderedGithubRepoIds.size(); i++) {
            UUID repoId = githubRepoIdToRepoId.get(orderedGithubRepoIds.get(i));
            if (repoId == null) continue;
            UUID userRepoId = repoIdToUserRepoId.get(repoId);
            if (userRepoId == null) continue;
            BlogRepositoryEntity blogRepo = userRepoIdToBlogRepo.get(userRepoId);
            if (blogRepo == null) continue;
            blogRepo.updateOrder(i);
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
