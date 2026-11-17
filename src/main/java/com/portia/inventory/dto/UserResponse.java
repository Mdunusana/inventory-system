package com.portia.inventory.dto;

import com.portia.inventory.entity.Role;
import com.portia.inventory.entity.User;

public class UserResponse {

    private Long userId;
    private String name;
    private String surname;
    private String email;
    private Role role;
    private boolean active;

    public UserResponse(User user) {
        this.userId = user.getUserId();
        this.name = user.getName();
        this.surname = user.getSurname();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.active = user.isActive();
    }

    public static UserResponse from(User user) {
        return new UserResponse(user);
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getSurname() {
        return surname;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }
}