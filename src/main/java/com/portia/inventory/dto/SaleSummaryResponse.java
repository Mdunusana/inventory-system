package com.portia.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.portia.inventory.entity.Sale;
import com.portia.inventory.entity.SaleStatus;
import com.portia.inventory.entity.User;

/**
 * One row in the sales list
 * (no items; open a single sale to see them).
 */
public record SaleSummaryResponse(
        Long saleId,
        LocalDateTime saleDate,
        String soldBy,
        BigDecimal totalAmount,
        SaleStatus status
) {

    public static SaleSummaryResponse from(Sale sale) {

        User user = sale.getUser();

        return new SaleSummaryResponse(
                sale.getSaleId(),
                sale.getSaleDate(),
                user.getName() + " " + user.getSurname(),
                sale.getTotalAmount(),
                sale.getStatus()
        );
    }
}