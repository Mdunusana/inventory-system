package com.portia.inventory.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * What the frontend sends when creating or editing a product.
 * Stock is NOT included: stock only changes through
 * receiving, sales and adjustments (so every change is logged).
 */
public record ProductRequest(

        @NotBlank(message = "Product code is required")
        @Size(max = 50, message = "Product code must be 50 characters or fewer")
        String productCode,

        @NotBlank(message = "Product name is required")
        @Size(max = 150, message = "Product name must be 150 characters or fewer")
        String productName,

        @Size(max = 500, message = "Description must be 500 characters or fewer")
        String description,

        @NotNull(message = "Category is required")
        Long categoryId,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.00", message = "Price cannot be negative")
        @Digits(integer = 8, fraction = 2, message = "Price can have at most 2 decimal places")
        BigDecimal price,

        @NotNull(message = "Minimum stock level is required")
        @Min(value = 0, message = "Minimum stock level cannot be negative")
        Integer minimumStockLevel

) {
}