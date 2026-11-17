package com.portia.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.portia.inventory.entity.Product;
import com.portia.inventory.entity.StockStatus;

/**
 * What the backend sends back about a product.
 */
public record ProductResponse(
        Long productId,
        String productCode,
        String productName,
        String description,
        Long categoryId,
        String categoryName,
        BigDecimal price,
        int minimumStockLevel,
        int currentStock,
        StockStatus stockStatus,
        boolean active,
        LocalDateTime createdDate
) {

    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getProductId(),
                product.getProductCode(),
                product.getProductName(),
                product.getDescription(),
                product.getCategory().getCategoryId(),
                product.getCategory().getCategoryName(),
                product.getPrice(),
                product.getMinimumStockLevel(),
                product.getCurrentStock(),
                product.getStockStatus(),
                product.isActive(),
                product.getCreatedDate());
    }
}
