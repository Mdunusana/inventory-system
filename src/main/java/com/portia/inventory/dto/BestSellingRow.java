package com.portia.inventory.dto;

import java.math.BigDecimal;

/**
 * One line of the best-selling report.
 * Revenue is the sum of the sale item subtotals.
 */
public record BestSellingRow(
        int rank,
        Long productId,
        String productCode,
        String productName,
        long unitsSold,
        BigDecimal revenue
) {
}