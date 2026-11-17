package com.portia.inventory.dto;

import com.portia.inventory.entity.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * An administrator creates a user and sets the first password
 * (which the user can then change).
 */
public record CreateUserRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be 100 characters or fewer")
        String name,

        @NotBlank(message = "Surname is required")
        @Size(max = 100, message = "Surname must be 100 characters or fewer")
        String surname,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        @Size(max = 255, message = "Email must be 255 characters or fewer")
        String email,

        // 72 is the longest password BCrypt can use.
        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
        String password,

        @NotNull(message = "Role is required")
        Role role

) {
}