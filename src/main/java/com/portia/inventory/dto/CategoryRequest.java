package com.portia.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * What the frontend sends when creating or renaming a category.
 */
public record CategoryRequest(

        @NotBlank(message = "Category name is required")
        @Size(max = 100, message = "Category name must be 100 characters or fewer")
        String categoryName

) {
}
