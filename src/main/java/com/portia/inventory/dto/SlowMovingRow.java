package com.portia.inventory.dto;

import java.time.LocalDateTime;

/**
 * One line of the slow-moving report.
 * lastSaleDate is null if the product has never been sold.
 */
public record SlowMovingRow(
        Long productId,
        String productCode,
        String productName,
        String categoryName,
        int currentStock,
        long unitsSold,
        LocalDateTime lastSaleDate
) {
}