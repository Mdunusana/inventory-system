package com.portia.inventory;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests the business rules end to end:
 * request through the API, then check the database directly.
 */
class BusinessRulesIntegrationTest extends IntegrationTestBase {

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    private ResultActions postJson(String url, String userEmail, String json)
            throws Exception {
        return mvc.perform(post(url)
                .header("Authorization", loginAs(userEmail))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json));
    }

    private int stockOf(long productId) {
        return jdbc.queryForObject(
                "SELECT current_stock FROM products WHERE product_id = ?",
                Integer.class, productId);
    }

    private int countRows(String sql, Object... args) {
        return jdbc.queryForObject(sql, Integer.class, args);
    }

    // ---------------------------------------------------------------
    // Stock: receive and adjust
    // ---------------------------------------------------------------

    @Test
    void receivingStockAddsStockAndLogsWhoDidIt() throws Exception {
        postJson("/api/stock/receive", SALES,
                "{\"productId\":1,\"quantity\":5,\"reference\":\"DN-T1\"}")
                .andExpect(status().isCreated());

        assertEquals(25, stockOf(1));

        // The movement is logged under the REAL user (sales = user 2),
        // which proves the CurrentUserService fix.
        assertEquals(1, countRows(
                "SELECT COUNT(*) FROM stock_movements "
                        + "WHERE product_id = 1 AND movement_type = 'RECEIVED' "
                        + "AND quantity_change = 5 AND user_id = 2 "
                        + "AND reference = 'DN-T1'"));
    }

    @Test
    void adjustmentCannotMakeStockNegative() throws Exception {
        // P-LOW has 3; taking away 4 must be refused (BR02)
        postJson("/api/stock/adjust", ADMIN,
                "{\"productId\":2,\"quantityChange\":-4,\"reason\":\"Test\"}")
                .andExpect(status().isConflict());

        assertEquals(3, stockOf(2));
        assertEquals(0, countRows(
                "SELECT COUNT(*) FROM stock_movements WHERE movement_type = 'ADJUSTMENT'"));
    }

    @Test
    void adjustmentWithoutReasonIsRejected() throws Exception {
        postJson("/api/stock/adjust", ADMIN,
                "{\"productId\":1,\"quantityChange\":-1,\"reason\":\"\"}")
                .andExpect(status().isBadRequest());

        assertEquals(20, stockOf(1));
    }

    // ---------------------------------------------------------------
    // Sales
    // ---------------------------------------------------------------

    @Test
    void saleReducesStockLogsMovementsAndUsesServerPrices() throws Exception {
        postJson("/api/sales", SALES,
                "{\"items\":[{\"productId\":1,\"quantity\":2},"
                        + "{\"productId\":2,\"quantity\":1}]}")
                .andExpect(status().isCreated());

        // Stock went down
        assertEquals(18, stockOf(1));
        assertEquals(2, stockOf(2));

        // One sale, recorded under the real user (sales = user 2)
        assertEquals(1, countRows("SELECT COUNT(*) FROM sales WHERE user_id = 2"));

        // Total comes from the SERVER's prices: 2 x R10 + 1 x R20 = R40
        BigDecimal total = jdbc.queryForObject(
                "SELECT total_amount FROM sales", BigDecimal.class);
        assertEquals(0, total.compareTo(new BigDecimal("40.00")));

        // One SALE movement per product, linked to the sale (today's bug fix)
        assertEquals(2, countRows(
                "SELECT COUNT(*) FROM stock_movements "
                        + "WHERE movement_type = 'SALE' AND sale_id IS NOT NULL"));
        assertEquals(1, countRows(
                "SELECT COUNT(*) FROM stock_movements "
                        + "WHERE movement_type = 'SALE' AND product_id = 1 "
                        + "AND quantity_change = -2"));
    }

    @Test
    void cannotSellMoreThanInStock() throws Exception {
        // P-LOW has 3; selling 4 must be refused
        postJson("/api/sales", SALES,
                "{\"items\":[{\"productId\":2,\"quantity\":4}]}")
                .andExpect(status().isConflict());

        assertEquals(3, stockOf(2));
        assertEquals(0, countRows("SELECT COUNT(*) FROM sales"));
    }

    @Test
    void cannotSellDeactivatedProduct() throws Exception {
        postJson("/api/sales", SALES,
                "{\"items\":[{\"productId\":4,\"quantity\":1}]}")
                .andExpect(status().isConflict());

        assertEquals(10, stockOf(4));
    }

    @Test
    void failedSaleChangesNothingAtAll() throws Exception {
        // First line is fine, second line is impossible.
        // The WHOLE sale must be refused: no half-sales.
        postJson("/api/sales", SALES,
                "{\"items\":[{\"productId\":1,\"quantity\":1},"
                        + "{\"productId\":3,\"quantity\":1}]}")
                .andExpect(status().isConflict());

        assertEquals(20, stockOf(1));
        assertEquals(0, countRows("SELECT COUNT(*) FROM sales"));
        assertEquals(0, countRows(
                "SELECT COUNT(*) FROM stock_movements WHERE movement_type = 'SALE'"));
    }

    @Test
    void sameProductTwiceBecomesOneLine() throws Exception {
        postJson("/api/sales", SALES,
                "{\"items\":[{\"productId\":1,\"quantity\":1},"
                        + "{\"productId\":1,\"quantity\":2}]}")
                .andExpect(status().isCreated());

        assertEquals(1, countRows("SELECT COUNT(*) FROM sale_items"));
        assertEquals(3, countRows("SELECT quantity FROM sale_items"));
        assertEquals(17, stockOf(1));
    }

    // ---------------------------------------------------------------
    // Products and categories
    // ---------------------------------------------------------------

    @Test
    void duplicateProductCodeIsRejectedEvenWithDifferentCapitals() throws Exception {
        postJson("/api/products", ADMIN,
                "{\"productCode\":\"p-ok\",\"productName\":\"Copy\","
                        + "\"categoryId\":1,\"price\":5.00,\"minimumStockLevel\":1}")
                .andExpect(status().isConflict());

        assertEquals(4, countRows("SELECT COUNT(*) FROM products"));
    }

    @Test
    void categoryWithProductsCannotBeDeletedButEmptyOneCan() throws Exception {
        mvc.perform(delete("/api/categories/1")
                        .header("Authorization", loginAs(ADMIN)))
                .andExpect(status().isConflict());

        mvc.perform(delete("/api/categories/2")
                        .header("Authorization", loginAs(ADMIN)))
                .andExpect(status().isNoContent());

        assertEquals(1, countRows("SELECT COUNT(*) FROM categories"));
    }

    // ---------------------------------------------------------------
    // 14C: Reconciliation (BR06)
    // ---------------------------------------------------------------

    @Test
    void stockAlwaysEqualsSumOfMovementsAfterMixedActivity() throws Exception {
        // A realistic mix of everything that changes stock
        postJson("/api/stock/receive", SALES,
                "{\"productId\":3,\"quantity\":12,\"reference\":\"DN-T2\"}")
                .andExpect(status().isCreated());

        postJson("/api/sales", SALES,
                "{\"items\":[{\"productId\":1,\"quantity\":4},"
                        + "{\"productId\":3,\"quantity\":2}]}")
                .andExpect(status().isCreated());

        postJson("/api/stock/adjust", ADMIN,
                "{\"productId\":2,\"quantityChange\":-1,\"reason\":\"Damaged\"}")
                .andExpect(status().isCreated());

        postJson("/api/sales", ADMIN,
                "{\"items\":[{\"productId\":1,\"quantity\":1}]}")
                .andExpect(status().isCreated());

        // The same check as database/03_verify.sql section 2.
        // EXPECT: no product where stock and movements disagree.
        List<Map<String, Object>> mismatches = jdbc.queryForList(
                "SELECT p.product_code, p.current_stock, "
                        + "COALESCE(SUM(m.quantity_change), 0) AS movement_total "
                        + "FROM products p "
                        + "LEFT JOIN stock_movements m ON m.product_id = p.product_id "
                        + "GROUP BY p.product_id, p.product_code, p.current_stock "
                        + "HAVING p.current_stock <> COALESCE(SUM(m.quantity_change), 0)");

        assertTrue(mismatches.isEmpty(),
                "Stock does not match movements for: " + mismatches);
    }
}