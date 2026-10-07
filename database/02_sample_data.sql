-- =====================================================================
-- File:    database/02_sample_data.sql
-- Purpose: MOCK DATA for development and testing ONLY. Not real
--          business data. Do not load into a production database.
-- Run:     After 01_schema.sql, on an empty database.
--
-- The data is built so that it matches your Wireless Mouse example and
-- so that every product's current_stock equals the sum of its movements.
-- Passwords: the hashes below are PLACEHOLDERS, not real hashes, so
-- nobody can log in with these rows. Real hashed passwords are created
-- by the application in Phase 12.
-- =====================================================================

USE inventory_db;

INSERT INTO categories (category_id, category_name) VALUES
    (1, 'Computer Accessories'),
    (2, 'Mobile Accessories'),
    (3, 'Stationery');

INSERT INTO users (user_id, name, surname, email, password_hash, role, is_active) VALUES
    (1, 'Test', 'Admin', 'admin@example.com', 'PLACEHOLDER-NOT-A-REAL-HASH', 'ADMIN',           TRUE),
    (2, 'Test', 'Sales', 'sales@example.com', 'PLACEHOLDER-NOT-A-REAL-HASH', 'SALES_INVENTORY', TRUE);

INSERT INTO products
    (product_id, product_code, product_name, description, category_id, price,
     minimum_stock_level, current_stock, is_active, created_date) VALUES
    (1, 'MOUSE-001', 'Wireless Mouse',     '2.4GHz wireless optical mouse', 1, 249.00, 10, 12, TRUE,  '2026-09-15 09:00:00'),
    (2, 'KEYB-001',  'USB Keyboard',       'Full-size wired keyboard',      1, 329.00,  5,  0, TRUE,  '2026-09-15 09:00:00'),
    (3, 'CHRG-001',  'Phone Charger',      '5V 2A wall charger',            2, 159.00,  8,  5, TRUE,  '2026-09-15 09:00:00'),
    (4, 'CABL-001',  'USB-C Cable',        '1m braided USB-C cable',        2,  89.00, 15, 25, TRUE,  '2026-09-15 09:00:00'),
    (5, 'NOTE-001',  'A4 Notebook',        '80-page ruled notebook',        3,  35.00, 20, 40, TRUE,  '2026-09-15 09:00:00'),
    (6, 'SPKR-001',  'Bluetooth Speaker',  'Discontinued model',            2, 499.00,  5,  3, FALSE, '2026-09-15 09:00:00');

INSERT INTO sales (sale_id, sale_date, user_id, total_amount, status) VALUES
    (1, '2026-09-28 10:15:00', 2, 1314.00, 'COMPLETED'),
    (2, '2026-09-30 14:40:00', 2,  795.00, 'COMPLETED'),
    (3, '2026-10-03 11:05:00', 2, 2641.00, 'COMPLETED');

INSERT INTO sale_items (sale_item_id, sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (1, 1, 1,  4, 249.00,  996.00),
    (2, 1, 3,  2, 159.00,  318.00),
    (3, 2, 5, 10,  35.00,  350.00),
    (4, 2, 4,  5,  89.00,  445.00),
    (5, 3, 1,  4, 249.00,  996.00),
    (6, 3, 2,  5, 329.00, 1645.00);

INSERT INTO stock_movements
    (stock_movement_id, product_id, user_id, sale_id, movement_type, quantity_change,
     movement_date, reference, reason) VALUES
    ( 1, 1, 1, NULL, 'RECEIVED',   20, '2026-09-15 09:00:00', 'Initial stock', NULL),
    ( 2, 2, 1, NULL, 'RECEIVED',    5, '2026-09-15 09:00:00', 'Initial stock', NULL),
    ( 3, 3, 1, NULL, 'RECEIVED',   10, '2026-09-15 09:00:00', 'Initial stock', NULL),
    ( 4, 4, 1, NULL, 'RECEIVED',   30, '2026-09-15 09:00:00', 'Initial stock', NULL),
    ( 5, 5, 1, NULL, 'RECEIVED',   50, '2026-09-15 09:00:00', 'Initial stock', NULL),
    ( 6, 6, 1, NULL, 'RECEIVED',    3, '2026-09-15 09:00:00', 'Initial stock', NULL),
    ( 7, 1, 2,    1, 'SALE',       -4, '2026-09-28 10:15:00', 'SALE-1',        NULL),
    ( 8, 3, 2,    1, 'SALE',       -2, '2026-09-28 10:15:00', 'SALE-1',        NULL),
    ( 9, 5, 2,    2, 'SALE',      -10, '2026-09-30 14:40:00', 'SALE-2',        NULL),
    (10, 4, 2,    2, 'SALE',       -5, '2026-09-30 14:40:00', 'SALE-2',        NULL),
    (11, 3, 1, NULL, 'ADJUSTMENT',  -3, '2026-10-01 16:30:00', 'Stock take',   'Damaged in storage'),
    (12, 1, 2,    3, 'SALE',       -4, '2026-10-03 11:05:00', 'SALE-3',        NULL),
    (13, 2, 2,    3, 'SALE',       -5, '2026-10-03 11:05:00', 'SALE-3',        NULL);
