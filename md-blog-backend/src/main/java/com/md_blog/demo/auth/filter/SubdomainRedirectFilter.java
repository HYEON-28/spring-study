package com.md_blog.demo.auth.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * 유저 서브도메인(hyeon-28.md-blog.org) 요청을 프론트엔드 경로(/blog/hyeon-28)로 리다이렉트.
 * Spring Security 필터보다 먼저 실행되어 OAuth 플로우가 불필요하게 시작되는 것을 방지.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SubdomainRedirectFilter extends OncePerRequestFilter {

    @Value("${frontend.url}")
    private String frontendUrl;

    @Value("${app.root.domain:md-blog.org}")
    private String rootDomain;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String host = resolveHost(request);

        if (isUserSubdomain(host)) {
            String username = host.split("\\.")[0];
            response.sendRedirect(frontendUrl + "/blog/" + username);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String resolveHost(HttpServletRequest request) {
        // ALB가 X-Forwarded-Host 헤더에 원본 호스트를 전달
        String forwarded = request.getHeader("X-Forwarded-Host");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim().split(":")[0].trim();
        }
        String host = request.getHeader("Host");
        if (host != null && !host.isBlank()) {
            return host.split(":")[0].trim();
        }
        return request.getServerName();
    }

    private boolean isUserSubdomain(String host) {
        if (host == null || !host.endsWith("." + rootDomain)) return false;
        String sub = host.substring(0, host.length() - rootDomain.length() - 1);
        return !sub.isEmpty()
                && !sub.equals("api")
                && !sub.equals("www")
                && !sub.contains(".");
    }
}
