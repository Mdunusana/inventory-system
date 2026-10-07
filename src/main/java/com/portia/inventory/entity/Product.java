package com.portia.inventory.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.portia.inventory.exception.InsufficientStockException;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_code", nullable = false, length = 50)
    private String productCode;

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Column(name = "description", length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "minimum_stock_level", nullable = false)
    private int minimumStockLevel;

    @Column(name = "current_stock", nullable = false)
    private int currentStock;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    protected Product() {
    }

    public Product(
            String productCode,
            String productName,
            String description,
            Category category,
            BigDecimal price,
            int minimumStockLevel) {

        this.productCode = productCode;
        this.productName = productName;
        this.description = description;
        this.category = category;
        this.price = price;
        this.minimumStockLevel = minimumStockLevel;
        this.currentStock = 0;
        this.active = true;
        this.createdDate = LocalDateTime.now();
    }

    public void updateDetails(
            String productCode,
            String productName,
            String description,
            Category category,
            BigDecimal price,
            int minimumStockLevel) {

        this.productCode = productCode;
        this.productName = productName;
        this.description = description;
        this.category = category;
        this.price = price;
        this.minimumStockLevel = minimumStockLevel;
    }

    /**
     * Business Rule BR02:
     * Stock may never become negative.
     */
    public void changeStock(int quantityChange) {

        int newStock = this.currentStock + quantityChange;

        if (newStock < 0) {
            throw new InsufficientStockException(
                    "Insufficient stock available");
        }

        this.currentStock = newStock;
    }

    public void activate() {
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
    }

    public StockStatus getStockStatus() {

        if (currentStock <= 0) {
            return StockStatus.OUT_OF_STOCK;
        }

        if (currentStock <= minimumStockLevel) {
            return StockStatus.LOW_STOCK;
        }

        return StockStatus.OK;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductCode() {
        return productCode;
    }

    public String getProductName() {
        return productName;
    }

    public String getDescription() {
        return description;
    }

    public Category getCategory() {
        return category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public int getMinimumStockLevel() {
        return minimumStockLevel;
    }

    public int getCurrentStock() {
        return currentStock;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
}