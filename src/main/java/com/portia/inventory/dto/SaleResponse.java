package com.portia.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.portia.inventory.entity.Sale;
import com.portia.inventory.entity.SaleStatus;
import com.portia.inventory.entity.User;

/**
 * A complete sale with its items.
 * Must be built while the database transaction is still open.
 */
public record SaleResponse(
        Long saleId,
        LocalDateTime saleDate,
        String soldBy,
        BigDecimal totalAmount,
        SaleStatus status,
        List<SaleItemResponse> items
) {

    public static SaleResponse from(Sale sale) {

        User user = sale.getUser();

        List<SaleItemResponse> items =
                sale.getItems()
                        .stream()
                        .map(SaleItemResponse::from)
                        .toList();

        return new SaleResponse(
                sale.getSaleId(),
                sale.getSaleDate(),
                user.getName() + " " + user.getSurname(),
                sale.getTotalAmount(),
                sale.getStatus(),
                items
        );
    }
}

