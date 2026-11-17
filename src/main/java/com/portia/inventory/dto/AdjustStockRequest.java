package com.portia.inventory.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdjustStockRequest(

        @NotNull(message = "Product is required")
        Long productId,

        @NotNull(message = "Quantity change is required")
        @Min(value = -1_000_000, message = "Quantity change is too small")
        @Max(value = 1_000_000, message = "Quantity change is too large")
        Integer quantityChange,

        @NotBlank(message = "Reason is required")
        @Size(max = 255, message = "Reason may not exceed 255 characters")
        String reason

) {
}