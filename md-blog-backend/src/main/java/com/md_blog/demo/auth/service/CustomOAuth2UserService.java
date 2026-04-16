package com.md_blog.demo.auth.service;

import com.md_blog.demo.user.entity.User;
import com.md_blog.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        Long githubId = ((Number) oAuth2User.getAttribute("id")).longValue();
        String githubUsername = oAuth2User.getAttribute("login");
        String name = oAuth2User.getAttribute("name");
        String email = oAuth2User.getAttribute("email");
        String avatarUrl = oAuth2User.getAttribute("avatar_url");
        String htmlUrl = oAuth2User.getAttribute("html_url");
        String accessToken = userRequest.getAccessToken().getTokenValue();

        User user = userRepository.findByGithubId(githubId)
                .map(existing -> {
                    existing.updateLoginInfo(githubUsername, name, email, avatarUrl, htmlUrl, accessToken);
                    return userRepository.save(existing);
                })
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .githubId(githubId)
                                .githubUsername(githubUsername)
                                .name(name)
                                .email(email)
                                .avatarUrl(avatarUrl)
                                .githubProfileUrl(htmlUrl)
                                .accessToken(accessToken)
                                .build()
                ));

        return new GitHubOAuth2User(oAuth2User, user);
    }
}
