package com.portia.inventory.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.portia.inventory.entity.User;
import com.portia.inventory.repository.UserRepository;

/**
 * Who is performing this action?
 *
 * TEMPORARY: until login exists (Phase 12), every action is
 * attributed to one seeded test user.
 *
 * In Phase 12, only the inside of getCurrentUser() changes.
 */
@Service
public class CurrentUserService {

    private final UserRepository userRepository;
    private final String temporaryUserEmail;

    public CurrentUserService(
            UserRepository userRepository,
            @Value("${app.temporary-user-email:admin@example.com}")
            String temporaryUserEmail) {

        this.userRepository = userRepository;
        this.temporaryUserEmail = temporaryUserEmail;
    }

    public User getCurrentUser() {

        return userRepository
                .findByEmailIgnoreCase(temporaryUserEmail)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Temporary user not found: "
                                        + temporaryUserEmail
                                        + ". Did you run database/02_sample_data.sql?"));
    }
}