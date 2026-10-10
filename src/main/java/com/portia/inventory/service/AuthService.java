package com.portia.inventory.service;

import org.springframework.stereotype.Service;

import com.portia.inventory.dto.LoginRequest;
import com.portia.inventory.entity.User;
import com.portia.inventory.exception.InvalidCredentialsException;
import com.portia.inventory.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User authenticate(LoginRequest request) {

        User user = userRepository
                .findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.isActive()) {
            throw new InvalidCredentialsException();
        }

        return user;
    }
}
