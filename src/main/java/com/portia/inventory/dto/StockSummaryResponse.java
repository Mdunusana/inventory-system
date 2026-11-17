package com.portia.inventory.dto;

/**
 * Headline numbers for ACTIVE products.
 *
 * activeProducts = okCount + lowStockCount + outOfStockCount
 */
public record StockSummaryResponse(
        long activeProducts,
        long okCount,
        long lowStockCount,
        long outOfStockCount,
        long totalUnitsInStock
) {
}