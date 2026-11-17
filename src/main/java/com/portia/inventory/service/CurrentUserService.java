package com.portia.inventory.service;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.portia.inventory.entity.User;
import com.portia.inventory.repository.UserRepository;

/**
 * Who is performing this action?
 * Returns the user who is logged in for the current request.
 */
@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException(
                    "You are not logged in");
        }

        return userRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException(
                        "You are not logged in"));
    }
}