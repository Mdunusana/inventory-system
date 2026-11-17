-- =====================================================================
-- File:    src/test/resources/db/test-schema.sql
-- Purpose: Builds a FRESH copy of the tables in inventory_test_db
--          every time the automated tests start.
-- Source:  Copied from database/01_schema.sql (keep the two in step).
-- Safety:  The USE line below means this script can ONLY ever touch
--          inventory_test_db, never your real inventory_db.
-- =====================================================================

USE inventory_test_db;

DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
    category_id    BIGINT       NOT NULL AUTO_INCREMENT,
    category_name  VARCHAR(100) NOT NULL,
    PRIMARY KEY (category_id),
    CONSTRAINT uk_categories_name UNIQUE (category_name)
) ENGINE = InnoDB;

CREATE TABLE users (
    user_id        BIGINT       NOT NULL AUTO_INCREMENT,
    name           VARCHAR(100) NOT NULL,
    surname        VARCHAR(100) NOT NULL,
    email          VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    role           VARCHAR(20)  NOT NULL,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (user_id),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'SALES_INVENTORY'))
) ENGINE = InnoDB;

CREATE TABLE products (
    product_id           BIGINT        NOT NULL AUTO_INCREMENT,
    product_code         VARCHAR(50)   NOT NULL,
    product_name         VARCHAR(150)  NOT NULL,
    description          VARCHAR(500)  NULL,
    category_id          BIGINT        NOT NULL,
    price                DECIMAL(10,2) NOT NULL,
    minimum_stock_level  INT           NOT NULL DEFAULT 0,
    current_stock        INT           NOT NULL DEFAULT 0,
    is_active            BOOLEAN       NOT NULL DEFAULT TRUE,
    created_date         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id),
    CONSTRAINT uk_products_code UNIQUE (product_code),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id)
        REFERENCES categories (category_id),
    CONSTRAINT chk_products_price         CHECK (price >= 0),
    CONSTRAINT chk_products_min_stock     CHECK (minimum_stock_level >= 0),
    CONSTRAINT chk_products_current_stock CHECK (current_stock >= 0),
    INDEX idx_products_name (product_name)
) ENGINE = InnoDB;

CREATE TABLE sales (
    sale_id       BIGINT        NOT NULL AUTO_INCREMENT,
    sale_date     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id       BIGINT        NOT NULL,
    total_amount  DECIMAL(10,2) NOT NULL,
    status        VARCHAR(20)   NOT NULL DEFAULT 'COMPLETED',
    PRIMARY KEY (sale_id),
    CONSTRAINT fk_sales_user FOREIGN KEY (user_id)
        REFERENCES users (user_id),
    CONSTRAINT chk_sales_total  CHECK (total_amount >= 0),
    CONSTRAINT chk_sales_status CHECK (status IN ('COMPLETED')),
    INDEX idx_sales_date (sale_date)
) ENGINE = InnoDB;

CREATE TABLE sale_items (
    sale_item_id  BIGINT        NOT NULL AUTO_INCREMENT,
    sale_id       BIGINT        NOT NULL,
    product_id    BIGINT        NOT NULL,
    quantity      INT           NOT NULL,
    unit_price    DECIMAL(10,2) NOT NULL,
    subtotal      DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (sale_item_id),
    CONSTRAINT fk_sale_items_sale FOREIGN KEY (sale_id)
        REFERENCES sales (sale_id),
    CONSTRAINT fk_sale_items_product FOREIGN KEY (product_id)
        REFERENCES products (product_id),
    CONSTRAINT chk_sale_items_quantity   CHECK (quantity > 0),
    CONSTRAINT chk_sale_items_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_sale_items_subtotal   CHECK (subtotal = quantity * unit_price)
) ENGINE = InnoDB;

CREATE TABLE stock_movements (
    stock_movement_id  BIGINT       NOT NULL AUTO_INCREMENT,
    product_id         BIGINT       NOT NULL,
    user_id            BIGINT       NOT NULL,
    sale_id            BIGINT       NULL,
    movement_type      VARCHAR(20)  NOT NULL,
    quantity_change    INT          NOT NULL,
    movement_date      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reference          VARCHAR(100) NULL,
    reason             VARCHAR(255) NULL,
    PRIMARY KEY (stock_movement_id),
    CONSTRAINT fk_movements_product FOREIGN KEY (product_id)
        REFERENCES products (product_id),
    CONSTRAINT fk_movements_user FOREIGN KEY (user_id)
        REFERENCES users (user_id),
    CONSTRAINT fk_movements_sale FOREIGN KEY (sale_id)
        REFERENCES sales (sale_id),
    CONSTRAINT chk_movements_type
        CHECK (movement_type IN ('RECEIVED', 'SALE', 'ADJUSTMENT')),
    CONSTRAINT chk_movements_nonzero
        CHECK (quantity_change <> 0),
    CONSTRAINT chk_movements_received_positive
        CHECK (movement_type <> 'RECEIVED' OR quantity_change > 0),
    CONSTRAINT chk_movements_sale_negative
        CHECK (movement_type <> 'SALE' OR quantity_change < 0),
    CONSTRAINT chk_movements_adjustment_reason
        CHECK (movement_type <> 'ADJUSTMENT'
               OR (reason IS NOT NULL AND CHAR_LENGTH(TRIM(reason)) > 0)),
    CONSTRAINT chk_movements_sale_link
        CHECK ((movement_type = 'SALE' AND sale_id IS NOT NULL)
            OR (movement_type <> 'SALE' AND sale_id IS NULL)),
    INDEX idx_movements_product_date (product_id, movement_date),
    INDEX idx_movements_date (movement_date)
) ENGINE = InnoDB;