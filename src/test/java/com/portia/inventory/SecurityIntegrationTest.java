package com.portia.inventory;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SecurityIntegrationTest extends IntegrationTestBase {

    private static final String ADJUST_BODY =
            "{\"productId\":1,\"quantityChange\":-1,\"reason\":\"Test adjustment\"}";

    @Value("${spring.datasource.url}")
    private String databaseUrl;

    @Test
    void testsUseTheTestDatabaseNeverTheRealOne() {
        assertTrue(databaseUrl.contains("inventory_test_db"),
                "Tests must use inventory_test_db but were using: " + databaseUrl);
    }

    @Test
    void loginWithCorrectPasswordReturnsToken() throws Exception {
        String header = loginAs(ADMIN);
        assertTrue(header.startsWith("Bearer ey"));
    }

    @Test
    void loginWithWrongPasswordIsRejected() throws Exception {
        login(ADMIN, "wrong-password").andExpect(status().isUnauthorized());
    }

    @Test
    void deactivatedUserCannotLogIn() throws Exception {
        login(INACTIVE, PASSWORD).andExpect(status().isUnauthorized());
    }

    @Test
    void requestWithoutTokenIsRejected() throws Exception {
        mvc.perform(get("/api/products"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void requestWithFakeTokenIsRejected() throws Exception {
        mvc.perform(get("/api/products")
                        .header("Authorization", "Bearer this.is.fake"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void salesUserCanViewProducts() throws Exception {
        mvc.perform(get("/api/products")
                        .header("Authorization", loginAs(SALES)))
                .andExpect(status().isOk());
    }

    @Test
    void salesUserCannotAdjustStock() throws Exception {
        mvc.perform(post("/api/stock/adjust")
                        .header("Authorization", loginAs(SALES))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ADJUST_BODY))
                .andExpect(status().isForbidden());
    }

    @Test
    void salesUserCannotOpenUserManagement() throws Exception {
        mvc.perform(get("/api/users")
                        .header("Authorization", loginAs(SALES)))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanAdjustStock() throws Exception {
        mvc.perform(post("/api/stock/adjust")
                        .header("Authorization", loginAs(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ADJUST_BODY))
                .andExpect(status().isCreated());
    }
}