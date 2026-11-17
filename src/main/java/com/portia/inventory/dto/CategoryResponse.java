package com.portia.inventory.dto;

import com.portia.inventory.entity.Category;

/**
 * What the backend sends back to the frontend.
 */
public record CategoryResponse(
        Long categoryId,
        String categoryName
) {

    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getCategoryId(),
                category.getCategoryName());
    }
}
