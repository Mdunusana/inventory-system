package com.portia.inventory.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.portia.inventory.dto.LoginRequest;
import com.portia.inventory.entity.User;
import com.portia.inventory.exception.InvalidCredentialsException;
import com.portia.inventory.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User authenticate(LoginRequest request) {

        User user = userRepository
                .findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.isActive()) {
            throw new InvalidCredentialsException();
        }

        System.out.println("================================");
        System.out.println("Entered Password: "
                + request.getPassword());
        System.out.println("Stored Hash: "
                + user.getPasswordHash());

        boolean matches = passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash());

        System.out.println("Password Matches: "
                + matches);
        System.out.println("================================");

        if (!matches) {
            throw new InvalidCredentialsException();
        }

        return user;
    }
}
