package com.example.demo.domain.command;

import jakarta.persistence.*;


@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;

    protected User() {} // JPA용

    private User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    // 팩토리 메서드 (Command → Entity)
    public static User create(String name, String email) {
        return new User(name, email);
    }

    // 비즈니스 행위
    public void changeEmail(String email) {
        this.email = email;
    }

    // getter만 공개
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
}