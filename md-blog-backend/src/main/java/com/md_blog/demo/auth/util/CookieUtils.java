package com.md_blog.demo.auth.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.*;
import java.util.Base64;
import java.util.Optional;

public class CookieUtils {

    public static Optional<Cookie> getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    return Optional.of(cookie);
                }
            }
        }
        return Optional.empty();
    }

    public static void addCookie(HttpServletResponse response, String name, String value,
                                  int maxAge, String domain, boolean secure) {
        StringBuilder sb = new StringBuilder();
        sb.append(name).append("=").append(value);
        sb.append("; Max-Age=").append(maxAge);
        sb.append("; Path=/");
        if (domain != null && !domain.isBlank()) {
            sb.append("; Domain=").append(domain);
        }
        sb.append("; HttpOnly");
        if (secure) {
            sb.append("; Secure; SameSite=None");
        } else {
            sb.append("; SameSite=Lax");
        }
        response.addHeader("Set-Cookie", sb.toString());
    }

    public static void deleteCookie(HttpServletResponse response, String name,
                                     String domain, boolean secure) {
        StringBuilder sb = new StringBuilder();
        sb.append(name).append("=");
        sb.append("; Max-Age=0");
        sb.append("; Path=/");
        if (domain != null && !domain.isBlank()) {
            sb.append("; Domain=").append(domain);
        }
        sb.append("; HttpOnly");
        if (secure) {
            sb.append("; Secure; SameSite=None");
        } else {
            sb.append("; SameSite=Lax");
        }
        response.addHeader("Set-Cookie", sb.toString());
    }

    public static String serialize(Object object) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ObjectOutputStream oos = new ObjectOutputStream(baos)) {
            oos.writeObject(object);
            oos.flush();
            return Base64.getUrlEncoder().encodeToString(baos.toByteArray());
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to serialize object", e);
        }
    }

    public static <T> T deserialize(Cookie cookie, Class<T> cls) {
        try {
            byte[] bytes = Base64.getUrlDecoder().decode(cookie.getValue());
            try (ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
                 ObjectInputStream ois = new ObjectInputStream(bais)) {
                return cls.cast(ois.readObject());
            }
        } catch (IOException | ClassNotFoundException e) {
            throw new IllegalArgumentException("Failed to deserialize cookie: " + e.getMessage(), e);
        }
    }
}
