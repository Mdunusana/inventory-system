package com.portia.inventory.dto;

import com.portia.inventory.entity.Category;
import com.portia.inventory.entity.Product;
import com.portia.inventory.entity.StockStatus;

/**
 * One row of a stock list:
 * product, current quantity, minimum level and status.
 */
public record StockLevelResponse(
        Long productId,
        String productCode,
        String productName,
        Long categoryId,
        String categoryName,
        int currentStock,
        int minimumStockLevel,
        StockStatus stockStatus,
        boolean active
) {

    /**
     * Must be called while the transaction is still open
     * because Category loads lazily.
     */
    public static StockLevelResponse from(Product product) {

        Category category = product.getCategory();

        return new StockLevelResponse(
                product.getProductId(),
                product.getProductCode(),
                product.getProductName(),
                category.getCategoryId(),
                category.getCategoryName(),
                product.getCurrentStock(),
                product.getMinimumStockLevel(),
                product.getStockStatus(),
                product.isActive()
        );
    }
}
