package com.md_blog.demo.repo.service;

import com.md_blog.demo.blog.repository.BlogRepositoryJpaRepository;
import com.md_blog.demo.repo.dto.ConnectedRepoResponse;
import com.md_blog.demo.repo.dto.GithubRepoDto;
import com.md_blog.demo.repo.entity.RepositoryEntity;
import com.md_blog.demo.repo.repository.RepositoryJpaRepository;
import com.md_blog.demo.user.entity.User;
import com.md_blog.demo.user.entity.UserRepositoryEntity;
import com.md_blog.demo.user.repository.UserRepositoryJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RepoConnectService {

    private final RepositoryJpaRepository repositoryJpaRepository;
    private final UserRepositoryJpaRepository userRepositoryJpaRepository;
    private final BlogRepositoryJpaRepository blogRepositoryJpaRepository;
    private final GithubApiService githubApiService;

    @Transactional(readOnly = true)
    public List<ConnectedRepoResponse> getConnectedRepos(User user) {
        List<UserRepositoryEntity> links = userRepositoryJpaRepository.findByUserIdAndActiveTrue(user.getId());
        if (links.isEmpty()) return List.of();

        Set<java.util.UUID> repoIds = links.stream()
                .map(UserRepositoryEntity::getRepositoryId)
                .collect(Collectors.toSet());

        List<RepositoryEntity> repos = repositoryJpaRepository.findAllById(repoIds);

        Set<Long> githubRepoIds = repos.stream()
                .map(RepositoryEntity::getGithubRepoId)
                .collect(Collectors.toSet());

        Map<Long, String> pushedAtMap = githubApiService
                .getReposByIds(user.getAccessToken(), githubRepoIds)
                .stream()
                .collect(Collectors.toMap(
                        GithubRepoDto.GithubApiResponse::id,
                        GithubRepoDto.GithubApiResponse::pushedAt
                ));

        // user_repositories id → repository id 역방향 맵
        Map<UUID, UUID> repoIdByUserRepoId = links.stream()
                .collect(Collectors.toMap(UserRepositoryEntity::getId, UserRepositoryEntity::getRepositoryId));

        // 블로그로 지정된 활성 레포 목록 (displayOrder 포함)
        var activeBlogRepos = blogRepositoryJpaRepository.findByUserIdAndActiveTrue(user.getId());

        Set<UUID> blogRepoEntityIds = activeBlogRepos.stream()
                .map(br -> repoIdByUserRepoId.get(br.getUserRepositoryId()))
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        // repoId → displayOrder
        Map<UUID, Integer> repoIdToDisplayOrder = activeBlogRepos.stream()
                .filter(br -> repoIdByUserRepoId.containsKey(br.getUserRepositoryId()))
                .collect(Collectors.toMap(
                        br -> repoIdByUserRepoId.get(br.getUserRepositoryId()),
                        br -> br.getDisplayOrder()
                ));

        return repos.stream()
                .map(r -> new ConnectedRepoResponse(
                        r.getGithubRepoId(),
                        r.getName(),
                        r.getDescription(),
                        r.getLanguage(),
                        r.getHtmlUrl(),
                        pushedAtMap.getOrDefault(r.getGithubRepoId(), ""),
                        blogRepoEntityIds.contains(r.getId()),
                        repoIdToDisplayOrder.getOrDefault(r.getId(), 0)
                ))
                .toList();
    }

    public void connectRepos(User user, List<GithubRepoDto> repos) {
        for (GithubRepoDto dto : repos) {
            RepositoryEntity repo = repositoryJpaRepository
                    .findByGithubRepoId(dto.githubRepoId())
                    .orElseGet(() -> repositoryJpaRepository.save(
                            RepositoryEntity.builder()
                                    .githubRepoId(dto.githubRepoId())
                                    .ownerGithubId(dto.ownerGithubId())
                                    .name(dto.name())
                                    .fullName(dto.fullName())
                                    .description(dto.description())
                                    .htmlUrl(dto.htmlUrl())
                                    .defaultBranch(dto.defaultBranch() != null ? dto.defaultBranch() : "main")
                                    .language(dto.language())
                                    .isPrivate(false)
                                    .build()
                    ));

            userRepositoryJpaRepository
                    .findByUserIdAndRepositoryId(user.getId(), repo.getId())
                    .ifPresentOrElse(
                            UserRepositoryEntity::activate,
                            () -> userRepositoryJpaRepository.save(
                                    UserRepositoryEntity.builder()
                                            .userId(user.getId())
                                            .repositoryId(repo.getId())
                                            .connectedAt(LocalDateTime.now())
                                            .active(true)
                                            .build()
                            )
                    );
        }
    }

    public void disconnectRepos(User user, List<Long> githubRepoIds) {
        List<RepositoryEntity> repos = repositoryJpaRepository.findAllByGithubRepoIdIn(githubRepoIds);
        Set<java.util.UUID> repoIds = repos.stream()
                .map(RepositoryEntity::getId)
                .collect(Collectors.toSet());

        List<UserRepositoryEntity> links =
                userRepositoryJpaRepository.findByUserIdAndRepositoryIdIn(user.getId(), repoIds);
        links.forEach(UserRepositoryEntity::deactivate);
    }
}
