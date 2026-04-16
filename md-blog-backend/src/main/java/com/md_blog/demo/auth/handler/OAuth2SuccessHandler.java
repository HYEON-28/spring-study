package com.md_blog.demo.auth.handler;

import com.md_blog.demo.auth.jwt.JwtProvider;
import com.md_blog.demo.auth.service.GitHubOAuth2User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        GitHubOAuth2User oAuth2User = (GitHubOAuth2User) authentication.getPrincipal();
        String token = jwtProvider.generateToken(oAuth2User.getUser().getId());
        getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/auth/callback?token=" + token);
    }
}
