package com.portia.inventory.dto;

import java.math.BigDecimal;

import com.portia.inventory.entity.Product;
import com.portia.inventory.entity.SaleItem;
import com.portia.inventory.entity.StockStatus;

/**
 * One line of a sale.
 *
 * currentStock and stockStatus describe the product's stock
 * RIGHT NOW.
 *
 * In the response to a new sale, that means
 * "after this sale" so you can immediately see
 * LOW_STOCK or OUT_OF_STOCK.
 */
public record SaleItemResponse(
        Long productId,
        String productCode,
        String productName,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal,
        int currentStock,
        StockStatus stockStatus
) {

    public static SaleItemResponse from(SaleItem item) {

        Product product = item.getProduct();

        return new SaleItemResponse(
                product.getProductId(),
                product.getProductCode(),
                product.getProductName(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getSubtotal(),
                product.getCurrentStock(),
                product.getStockStatus()
        );
    }
}