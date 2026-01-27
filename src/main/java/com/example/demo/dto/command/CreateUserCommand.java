package com.example.demo.dto.command;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateUserCommand(
    @NotBlank
    String name;

    @Email
    String email;
){}
