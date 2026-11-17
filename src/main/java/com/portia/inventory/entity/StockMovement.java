package com.portia.inventory.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * One row of the stock_movements table.
 * This is the audit trail of every stock change.
 */
@Entity
@Table(name = "stock_movements")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stock_movement_id")
    private Long stockMovementId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "sale_id")
    private Long saleId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "movement_type", nullable = false, length = 20)
    private MovementType movementType;

    @Column(name = "quantity_change", nullable = false)
    private int quantityChange;

    @Column(name = "movement_date", nullable = false, updatable = false)
    private LocalDateTime movementDate;

    @Column(name = "reference", length = 100)
    private String reference;

    @Column(name = "reason", length = 255)
    private String reason;

    protected StockMovement() {
        // Required by Hibernate
    }

    public StockMovement(
            Product product,
            User user,
            Long saleId,
            MovementType movementType,
            int quantityChange,
            String reference,
            String reason) {

        this.product = product;
        this.user = user;
        this.saleId = saleId;
        this.movementType = movementType;
        this.quantityChange = quantityChange;
        this.movementDate = LocalDateTime.now();
        this.reference = reference;
        this.reason = reason;
    }

    public Long getStockMovementId() {
        return stockMovementId;
    }

    public Product getProduct() {
        return product;
    }

    public User getUser() {
        return user;
    }

    public Long getSaleId() {
        return saleId;
    }

    public MovementType getMovementType() {
        return movementType;
    }

    public int getQuantityChange() {
        return quantityChange;
    }

    public LocalDateTime getMovementDate() {
        return movementDate;
    }

    public String getReference() {
        return reference;
    }

    public String getReason() {
        return reason;
    }
}