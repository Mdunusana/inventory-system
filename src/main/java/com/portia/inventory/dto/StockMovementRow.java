package com.portia.inventory.dto;

import java.time.LocalDateTime;

import com.portia.inventory.entity.MovementType;
import com.portia.inventory.entity.Product;
import com.portia.inventory.entity.StockMovement;
import com.portia.inventory.entity.User;

/**
 * One line of the stock movement report:
 * product, type, quantity, date and user.
 */
public record StockMovementRow(
        Long stockMovementId,
        LocalDateTime movementDate,
        Long productId,
        String productCode,
        String productName,
        MovementType movementType,
        int quantityChange,
        String userName,
        String reference,
        String reason,
        Long saleId
) {

    /**
     * Must be called while the transaction is open
     * because Product and User load lazily.
     */
    public static StockMovementRow from(
            StockMovement movement) {

        Product product = movement.getProduct();
        User user = movement.getUser();

        return new StockMovementRow(
                movement.getStockMovementId(),
                movement.getMovementDate(),
                product.getProductId(),
                product.getProductCode(),
                product.getProductName(),
                movement.getMovementType(),
                movement.getQuantityChange(),
                user.getName() + " " + user.getSurname(),
                movement.getReference(),
                movement.getReason(),
                movement.getSaleId()
        );
    }
}