package com.portia.inventory.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

/**
 * The JSON for recording a sale (FR05).
 * BR04: at least one item.
 */
public record SaleRequest(

        @NotEmpty(message = "A sale must contain at least one item")
        @Size(max = 200, message = "A sale can contain at most 200 lines")
        @Valid
        List<SaleItemRequest> items

) {
}