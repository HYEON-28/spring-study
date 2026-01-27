package com.example.demo.application;

import org.springframework.stereotype.Service;


@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 생성
    public UserResponse createUser(CreateUserCommand command) {
        User user = User.create(
                command.name(),
                command.email()
        );

        User savedUser = userRepository.save(user);
        return UserResponse.from(savedUser);
    }

    // 조회
    @Transactional(readOnly = true)
    public List<UserResponse> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }
}