package com.portia.inventory.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portia.inventory.dto.ChangePasswordRequest;
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
    private final CurrentUserService currentUserService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService,
            CurrentUserService currentUserService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.currentUserService = currentUserService;

        // TEMPORARY DEBUG
        System.out.println("BCrypt hash for Admin123!:");
        System.out.println(passwordEncoder.encode("Admin123!"));
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

        // TEMPORARY DEBUG
        System.out.println("Login attempt for: " + request.getEmail());
        System.out.println("Password entered: " + request.getPassword());
        System.out.println("Password matches: " + matches);

        if (!matches) {
            throw new InvalidCredentialsException();
        }

        return jwtTokenService.generateToken(user);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {

        User currentUser = currentUserService.getCurrentUser();

        boolean matches = passwordEncoder.matches(
                request.currentPassword(),
                currentUser.getPasswordHash());

        if (!matches) {
            throw new IllegalArgumentException(
                    "Current password is incorrect");
        }

        currentUser.setPasswordHash(
                passwordEncoder.encode(request.newPassword()));

        userRepository.save(currentUser);
    }
}