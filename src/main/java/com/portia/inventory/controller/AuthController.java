package com.portia.inventory.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.portia.inventory.dto.LoginRequest;
import com.portia.inventory.dto.UserResponse;
import com.portia.inventory.entity.User;
import com.portia.inventory.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public UserResponse login(
            @RequestBody LoginRequest request) {

        User user =
                authService.authenticate(request);

        return new UserResponse(user);
    }
}