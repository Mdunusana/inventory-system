package com.portia.inventory.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.portia.inventory.dto.LoginRequest;
import com.portia.inventory.entity.User;
import com.portia.inventory.exception.InvalidCredentialsException;
import com.portia.inventory.repository.UserRepository;
import com.portia.inventory.security.JwtTokenService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    public String authenticate(LoginRequest request) {

        User user = userRepository
                .findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.isActive()) {
            throw new InvalidCredentialsException();
        }

        boolean matches = passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash());

        if (!matches) {
            throw new InvalidCredentialsException();
        }

        return jwtTokenService.generateToken(user);
    }
}