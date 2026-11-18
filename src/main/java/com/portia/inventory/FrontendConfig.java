package com.portia.inventory;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Lets the Spring Boot app serve the React screens as well as the API,
 * so the whole system runs online from ONE web address.
 *
 * When the app is built for going online (see the Dockerfile), the built
 * React files are copied into src/main/resources/static. Spring Boot serves
 * that folder automatically: "/" gives index.html, "/assets/..." gives the
 * JavaScript and CSS.
 *
 * Two problems are solved here:
 *
 * 1. Security. The main rules in config/SecurityConfig say every request
 *    needs a token. A browser opening the website for the first time has no
 *    token yet, so the screens themselves must be public. This filter chain
 *    runs FIRST (@Order(1)) and only for addresses that do NOT start with
 *    /api/. Everything under /api/ still goes through SecurityConfig, so the
 *    data stays protected exactly as before.
 *
 * 2. Page refresh. React Router handles addresses like /products or
 *    /products/5/edit inside the browser. If someone refreshes on such a page
 *    or opens a shared link, the request reaches the server, which has no
 *    file with that name. The controller below answers those addresses with
 *    index.html, and React then shows the right screen.
 */
@Configuration
public class FrontendConfig {

    @Bean
    @Order(1)
    public SecurityFilterChain frontendFilterChain(
            HttpSecurity http) throws Exception {

        http
            .securityMatcher(request ->
                    !request.getRequestURI().startsWith("/api/"))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                    .anyRequest()
                    .permitAll());

        return http.build();
    }

    @Controller
    static class SpaForwardController {

        // Matches addresses with 1 to 3 parts and no dot in the last part
        // (so real files like /assets/index-abc.js or /favicon.svg are
        // left alone). Real API addresses such as /api/products are fixed
        // words, and Spring always prefers a fixed word over a {variable},
        // so the REST controllers still answer those.
        @GetMapping({
                "/{page:[^.]*}",
                "/{section}/{page:[^.]*}",
                "/{section}/{id}/{page:[^.]*}"
        })
        public String forwardToReact() {
            return "forward:/index.html";
        }
    }
}
