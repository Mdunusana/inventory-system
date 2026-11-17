-- =====================================================================
-- File:    database/04_backfill_sale_movements.sql
-- Purpose: One-off repair (Phase 14A, 2026-11-17).
--          Before the SaleService fix, sales reduced current_stock but
--          did NOT log SALE stock movements (sales #4 and #5).
--          This adds the missing movements so BR06 holds again:
--          current_stock = SUM(quantity_change) for every product.
-- Safe to re-run: NOT EXISTS skips sales that already have movements.
-- =====================================================================

USE inventory_db;

START TRANSACTION;

INSERT INTO stock_movements
    (product_id, user_id, sale_id, movement_type, quantity_change,
     movement_date, reference, reason)
SELECT si.product_id, s.user_id, s.sale_id, 'SALE', -si.quantity,
       s.sale_date, CONCAT('SALE-', s.sale_id),
       'Backfilled: movement was not logged by old code'
FROM sale_items si
JOIN sales s ON s.sale_id = si.sale_id
WHERE NOT EXISTS (
    SELECT 1 FROM stock_movements m
    WHERE m.sale_id = s.sale_id
      AND m.product_id = si.product_id
      AND m.movement_type = 'SALE'
);

-- Reconciliation check. EXPECT: zero rows. If any rows appear, ROLLBACK.
SELECT p.product_id, p.product_code, p.current_stock,
       COALESCE(SUM(m.quantity_change), 0) AS movement_total
FROM products p
LEFT JOIN stock_movements m ON m.product_id = p.product_id
GROUP BY p.product_id, p.product_code, p.current_stock
HAVING p.current_stock <> COALESCE(SUM(m.quantity_change), 0);

COMMIT;

-- Result on 2026-11-17: 4 rows inserted (sale #4: MOUSE-001 x4;
-- sale #5: MOUSE-001 x2, KEYB-001 x1, CABL-001 x1). Check returned zero rows.