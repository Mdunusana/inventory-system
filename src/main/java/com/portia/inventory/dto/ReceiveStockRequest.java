package com.portia.inventory.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReceiveStockRequest(

        @NotNull(message = "Product is required")
        Long productId,

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        @Max(value = 1_000_000, message = "Quantity may not exceed 1,000,000")
        Integer quantity,

        @Size(max = 100, message = "Reference may not exceed 100 characters")
        String reference

) {
}