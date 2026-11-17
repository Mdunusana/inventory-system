package com.portia.inventory.dto;

import java.math.BigDecimal;

/**
 * Headline numbers for the dashboard (active products only).
 */
public record DashboardResponse(
        long activeProducts,
        long okCount,
        long lowStockCount,
        long outOfStockCount,
        long unitsInStock,
        BigDecimal inventoryValue,
        long salesTodayCount,
        BigDecimal salesTodayTotal
) {
}