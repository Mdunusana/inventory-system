package com.portia.inventory.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * One line of a sale request.
 * There is no price field: the server always uses the product's price.
 */
public record SaleItemRequest(

        @NotNull(message = "Product is required")
        Long productId,

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        @Max(value = 100_000, message = "Quantity is too large")
        Integer quantity

) {
}
