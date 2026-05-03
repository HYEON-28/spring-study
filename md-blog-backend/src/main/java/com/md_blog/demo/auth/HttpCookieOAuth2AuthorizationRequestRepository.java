package com.md_blog.demo.auth;

import com.md_blog.demo.auth.util.CookieUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

/**
 * OAuth2 인가 요청 상태를 서버 세션이 아닌 쿠키에 저장.
 * 멀티 인스턴스 배포 시 서버 간 세션 공유 없이 OAuth 흐름이 완료될 수 있도록 함.
 */
@Slf4j
@Component
public class HttpCookieOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    private static final String COOKIE_NAME = "oauth2_auth_request";
    private static final int COOKIE_EXPIRE_SECONDS = 180;

    @Value("${app.cookie.domain:}")
    private String cookieDomain;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        // 역직렬화 실패 시 null 반환. 예외 전파 시 OAuth FailureHandler를 거치지 못하고
        // 컨테이너의 /error → SecurityFilter → entry point 루프로 이어진다.
        return CookieUtils.getCookie(request, COOKIE_NAME)
                .map(cookie -> {
                    try {
                        return CookieUtils.deserialize(cookie, OAuth2AuthorizationRequest.class);
                    } catch (RuntimeException ex) {
                        log.warn("oauth2_auth_request 쿠키 역직렬화 실패 — 쿠키를 무시합니다: {}", ex.getMessage());
                        return null;
                    }
                })
                .orElse(null);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                          HttpServletRequest request,
                                          HttpServletResponse response) {
        if (authorizationRequest == null) {
            CookieUtils.deleteCookie(response, COOKIE_NAME, cookieDomain, cookieSecure);
            return;
        }
        try {
            CookieUtils.addCookie(response, COOKIE_NAME,
                    CookieUtils.serialize(authorizationRequest),
                    COOKIE_EXPIRE_SECONDS, cookieDomain, cookieSecure);
        } catch (RuntimeException ex) {
            log.error("oauth2_auth_request 쿠키 저장 실패 — OAuth 콜백에서 state 매칭이 실패할 수 있음", ex);
        }
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
                                                                  HttpServletResponse response) {
        OAuth2AuthorizationRequest authRequest = loadAuthorizationRequest(request);
        CookieUtils.deleteCookie(response, COOKIE_NAME, cookieDomain, cookieSecure);
        return authRequest;
    }
}
