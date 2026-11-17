package com.portia.inventory.service;

import com.portia.inventory.dto.CreateUserRequest;
import com.portia.inventory.dto.PageResponse;
import com.portia.inventory.dto.UserResponse;
import com.portia.inventory.entity.User;
import com.portia.inventory.exception.ConflictException;
import com.portia.inventory.exception.ResourceNotFoundException;
import com.portia.inventory.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private static final int MAX_PAGE_SIZE = 100;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserService currentUserService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            CurrentUserService currentUserService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> findAll(int page, int size) {

        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
                Sort.by("surname", "name")
        );

        Page<User> result = userRepository.findAll(pageable);

        return PageResponse.from(result.map(UserResponse::from));
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return UserResponse.from(getUserOrThrow(id));
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {

        String email = request.email().trim();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException(
                    "Email is already in use: " + email
            );
        }

        User user = new User(
                request.name().trim(),
                request.surname().trim(),
                email,
                passwordEncoder.encode(request.password()),
                request.role()
        );

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse deactivate(Long id) {

        User current = currentUserService.getCurrentUser();

        if (current.getUserId().equals(id)) {
            throw new ConflictException(
                    "You cannot deactivate your own account"
            );
        }

        User user = getUserOrThrow(id);
        user.deactivate();

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse activate(Long id) {

        User user = getUserOrThrow(id);
        user.activate();

        return UserResponse.from(userRepository.save(user));
    }

    private User getUserOrThrow(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: " + id));
    }
}