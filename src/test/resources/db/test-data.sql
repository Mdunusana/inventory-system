-- =====================================================================
-- File:    src/test/resources/db/test-data.sql
-- Purpose: A small, KNOWN set of data. It is reloaded before EVERY test,
--          so each test starts from exactly the same state.
-- Logins:  all three users have the password:  password
-- =====================================================================

USE inventory_test_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE stock_movements;
TRUNCATE TABLE sale_items;
TRUNCATE TABLE sales;
TRUNCATE TABLE products;
TRUNCATE TABLE users;
TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO categories (category_id, category_name) VALUES
    (1, 'Test Category'),
    (2, 'Empty Category');

INSERT INTO users (user_id, name, surname, email, password_hash, role, is_active) VALUES
    (1, 'Admin', 'Tester', 'admin@test.com',
        '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'ADMIN', TRUE),
    (2, 'Sales', 'Tester', 'sales@test.com',
        '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'SALES_INVENTORY', TRUE),
    (3, 'Inactive', 'Tester', 'inactive@test.com',
        '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'SALES_INVENTORY', FALSE);

-- P-OK: plenty of stock | P-LOW: below minimum | P-OUT: none | P-OFF: deactivated
INSERT INTO products
    (product_id, product_code, product_name, description, category_id, price,
     minimum_stock_level, current_stock, is_active, created_date) VALUES
    (1, 'P-OK',  'Product OK',       NULL, 1, 10.00, 5, 20, TRUE,  '2026-01-01 09:00:00'),
    (2, 'P-LOW', 'Product Low',      NULL, 1, 20.00, 5,  3, TRUE,  '2026-01-01 09:00:00'),
    (3, 'P-OUT', 'Product Out',      NULL, 1, 30.00, 5,  0, TRUE,  '2026-01-01 09:00:00'),
    (4, 'P-OFF', 'Product Inactive', NULL, 1, 40.00, 5, 10, FALSE, '2026-01-01 09:00:00');

-- Opening stock, so current_stock = sum of movements (BR06) from the start
INSERT INTO stock_movements
    (stock_movement_id, product_id, user_id, sale_id, movement_type, quantity_change,
     movement_date, reference, reason) VALUES
    (1, 1, 1, NULL, 'RECEIVED', 20, '2026-01-01 09:00:00', 'Opening stock', NULL),
    (2, 2, 1, NULL, 'RECEIVED',  3, '2026-01-01 09:00:00', 'Opening stock', NULL),
    (3, 4, 1, NULL, 'RECEIVED', 10, '2026-01-01 09:00:00', 'Opening stock', NULL);