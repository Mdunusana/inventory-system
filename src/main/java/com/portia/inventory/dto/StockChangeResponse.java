package com.portia.inventory.dto;

import com.portia.inventory.entity.MovementType;
import com.portia.inventory.entity.StockStatus;

public record StockChangeResponse(
        Long productId,
        String productCode,
        String productName,
        MovementType movementType,
        int quantityChange,
        int previousStock,
        int currentStock,
        StockStatus stockStatus,
        String reference,
        String reason
) {
}