package com.portia.inventory;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import jakarta.servlet.Filter;

/**
 * Shared setup for all integration tests.
 * - "local" gives the DB password and JWT secret; "test" then switches
 *   the database to inventory_test_db.
 * - test-data.sql is reloaded before EVERY test.
 * - MockMvc sends requests through the real security filters,
 *   just like the browser does, but without starting a server.
 */
@SpringBootTest
@ActiveProfiles({"local", "test"})
@Sql("classpath:db/test-data.sql")
public abstract class IntegrationTestBase {

    protected static final String ADMIN = "admin@test.com";
    protected static final String SALES = "sales@test.com";
    protected static final String INACTIVE = "inactive@test.com";
    protected static final String PASSWORD = "password";

    private static final Pattern TOKEN =
            Pattern.compile("\"accessToken\"\\s*:\\s*\"([^\"]+)\"");

    @Autowired
    private WebApplicationContext context;

    @Autowired
    @Qualifier("springSecurityFilterChain")
    private Filter springSecurityFilterChain;

    @Autowired
    protected JdbcTemplate jdbc;

    protected MockMvc mvc;

    @BeforeEach
    void setUpMockMvc() {
        mvc = MockMvcBuilders
                .webAppContextSetup(context)
                .addFilters(springSecurityFilterChain)
                .build();
    }

    /** Sends a login request (used to test good AND bad logins). */
    protected ResultActions login(String email, String password) throws Exception {
        return mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"));
    }

    /** Logs in and returns the ready-to-use header value "Bearer <token>". */
    protected String loginAs(String email) throws Exception {
        String body = login(email, PASSWORD)
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Matcher matcher = TOKEN.matcher(body);
        assertTrue(matcher.find(), "No token in login response: " + body);

        return "Bearer " + matcher.group(1);
    }
}
