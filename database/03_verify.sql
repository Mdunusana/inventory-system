-- =====================================================================
-- File:    database/03_verify.sql
-- Purpose: Checks that the schema and mock data behave correctly.
-- Run:     After 02_sample_data.sql. Run each section on its own and
--          compare the result with the "EXPECT" comment.
-- =====================================================================

USE inventory_db;

-- 1. Row counts ---------------------------------------------------------
-- EXPECT: categories 3, users 2, products 6, sales 3, sale_items 6, stock_movements 13
SELECT 'categories' AS table_name, COUNT(*) AS row_count FROM categories
UNION ALL SELECT 'users',           COUNT(*) FROM users
UNION ALL SELECT 'products',        COUNT(*) FROM products
UNION ALL SELECT 'sales',           COUNT(*) FROM sales
UNION ALL SELECT 'sale_items',      COUNT(*) FROM sale_items
UNION ALL SELECT 'stock_movements', COUNT(*) FROM stock_movements;

-- 2. Stock reconciliation (BR06) ---------------------------------------
-- current_stock must equal the sum of the product's movements.
-- EXPECT: zero rows. Any row returned means the numbers disagree.
SELECT p.product_id, p.product_code, p.current_stock,
       COALESCE(SUM(m.quantity_change), 0) AS movement_total
FROM products p
LEFT JOIN stock_movements m ON m.product_id = p.product_id
GROUP BY p.product_id, p.product_code, p.current_stock
HAVING p.current_stock <> COALESCE(SUM(m.quantity_change), 0);

-- 3. Stock status (BR07) ------------------------------------------------
-- EXPECT: MOUSE-001 OK (12 is above the minimum of 10; one more sale of 4 would make it 8 = LOW_STOCK),
--         KEYB-001 OUT_OF_STOCK, CHRG-001 LOW_STOCK, CABL-001 OK, NOTE-001 OK,
--         SPKR-001 LOW_STOCK (it is deactivated, so later we decide whether reports should hide it)
SELECT product_code, current_stock, minimum_stock_level,
       CASE
           WHEN current_stock = 0                      THEN 'OUT_OF_STOCK'
           WHEN current_stock <= minimum_stock_level   THEN 'LOW_STOCK'
           ELSE 'OK'
       END AS stock_status
FROM products
ORDER BY product_id;

-- 4. Sale totals match their items --------------------------------------
-- EXPECT: zero rows.
SELECT s.sale_id, s.total_amount, SUM(si.subtotal) AS items_total
FROM sales s
JOIN sale_items si ON si.sale_id = s.sale_id
GROUP BY s.sale_id, s.total_amount
HAVING s.total_amount <> SUM(si.subtotal);

-- 5. The constraints must REJECT bad data -------------------------------
-- Run each statement alone. Every one should FAIL with an error.
-- If one succeeds, tell me, because a rule is not working.
-- (Delete or ROLLBACK anything that unexpectedly succeeds.)

-- 5a. Negative stock (BR02)           EXPECT: check constraint violated
-- UPDATE products SET current_stock = -1 WHERE product_id = 1;

-- 5b. Duplicate product code (BR01)   EXPECT: duplicate entry
-- INSERT INTO products (product_code, product_name, category_id, price)
--     VALUES ('MOUSE-001', 'Copy of mouse', 1, 10.00);

-- 5c. Adjustment without a reason     EXPECT: check constraint violated
-- INSERT INTO stock_movements (product_id, user_id, movement_type, quantity_change)
--     VALUES (1, 1, 'ADJUSTMENT', -1);

-- 5d. A sale movement with a positive quantity   EXPECT: check constraint violated
-- INSERT INTO stock_movements (product_id, user_id, sale_id, movement_type, quantity_change)
--     VALUES (1, 2, 1, 'SALE', 5);

-- 5e. Deleting a category that has products      EXPECT: foreign key error
-- DELETE FROM categories WHERE category_id = 1;

-- 5f. A sale item with a wrong subtotal          EXPECT: check constraint violated
-- INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
--     VALUES (1, 1, 2, 249.00, 1.00);
