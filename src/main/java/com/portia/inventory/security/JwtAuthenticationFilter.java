package com.portia.inventory.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.portia.inventory.entity.User;
import com.portia.inventory.repository.UserRepository;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Runs once per request.
 * If the request has a valid token, it looks the user up in the
 * database and tells Spring Security who they are and what role they have.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenService jwtTokenService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtTokenService jwtTokenService,
            UserRepository userRepository) {

        this.jwtTokenService = jwtTokenService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // No token: continue as an anonymous visitor
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String email;

        try {
            // Checks the signature AND the expiry time
            email = jwtTokenService.extractUsername(token);
        } catch (JwtException | IllegalArgumentException ex) {
            // Bad or expired token: continue as anonymous (results in 401)
            filterChain.doFilter(request, response);
            return;
        }

        if (email != null
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Use the role stored in the DATABASE, and only for active users
            userRepository.findByEmailIgnoreCase(email)
                    .filter(User::isActive)
                    .ifPresent(user -> {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        user.getEmail(),
                                        null,
                                        List.of(new SimpleGrantedAuthority(
                                                "ROLE_" + user.getRole().name())));

                        authToken.setDetails(
                                new WebAuthenticationDetailsSource()
                                        .buildDetails(request));

                        SecurityContextHolder.getContext()
                                .setAuthentication(authToken);
                    });
        }

        filterChain.doFilter(request, response);
    }
}