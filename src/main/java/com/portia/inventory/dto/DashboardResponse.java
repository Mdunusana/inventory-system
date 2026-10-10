package com.portia.inventory.dto;

import java.math.BigDecimal;

public record DashboardResponse(
        long totalProducts,
        long activeProducts,
        long lowStockProducts,
        BigDecimal totalSalesToday,
        BigDecimal inventoryValue) {
}