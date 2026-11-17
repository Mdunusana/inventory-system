package com.portia.inventory.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.portia.inventory.dto.ChangePasswordRequest;
import com.portia.inventory.dto.LoginRequest;
import com.portia.inventory.dto.LoginResponse;
import com.portia.inventory.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request) {

        String token = authService.authenticate(request);

        return new LoginResponse(
                token,
                "Bearer");
    }

    @PostMapping("/change-password")
    public void changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        authService.changePassword(request);
    }
}