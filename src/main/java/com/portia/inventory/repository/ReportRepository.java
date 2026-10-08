package com.portia.inventory.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.portia.inventory.entity.MovementType;
import com.portia.inventory.entity.Product;
import com.portia.inventory.entity.SaleItem;
import com.portia.inventory.entity.StockMovement;

/**
 * Read-only queries for reports.
 * It extends the bare Repository marker (not JpaRepository)
 * on purpose: it offers NO save or delete.
 */
public interface ReportRepository extends Repository<SaleItem, Long> {

    interface BestSellingProjection {

        Long getProductId();

        String getProductCode();

        String getProductName();

        Long getUnitsSold();

        BigDecimal getRevenue();
    }

    interface SalesTotalProjection {

        Long getProductId();

        Long getUnitsSold();

        LocalDateTime getLastSaleDate();
    }

    @Query("""
            SELECT p.productId AS productId,
                   p.productCode AS productCode,
                   p.productName AS productName,
                   SUM(si.quantity) AS unitsSold,
                   SUM(si.subtotal) AS revenue
            FROM SaleItem si
            JOIN si.product p
            JOIN si.sale s
            WHERE s.saleDate >= :fromTime
              AND s.saleDate < :toTime
            GROUP BY p.productId,
                     p.productCode,
                     p.productName
            ORDER BY SUM(si.quantity) DESC,
                     p.productName ASC
            """)
    List<BestSellingProjection> findBestSelling(
            @Param("fromTime") LocalDateTime fromTime,
            @Param("toTime") LocalDateTime toTime,
            Pageable pageable);

    @Query("""
            SELECT si.product.productId AS productId,
                   SUM(CASE WHEN s.saleDate >= :since
                            THEN si.quantity
                            ELSE 0 END) AS unitsSold,
                   MAX(s.saleDate) AS lastSaleDate
            FROM SaleItem si
            JOIN si.sale s
            GROUP BY si.product.productId
            """)
    List<SalesTotalProjection> findSalesTotals(
            @Param("since") LocalDateTime since);

    @EntityGraph(attributePaths = "category")
    @Query("""
            SELECT p
            FROM Product p
            WHERE p.active = true
              AND p.currentStock > 0
              AND p.createdDate < :createdBefore
            """)
    List<Product> findSlowMovingCandidates(
            @Param("createdBefore") LocalDateTime createdBefore);

    @EntityGraph(attributePaths = {"product", "user"})
    @Query(
            value = """
                    SELECT m
                    FROM StockMovement m
                    WHERE (:fromTime IS NULL OR m.movementDate >= :fromTime)
                      AND (:toTime IS NULL OR m.movementDate < :toTime)
                      AND (:productId IS NULL OR m.product.productId = :productId)
                      AND (:movementType IS NULL OR m.movementType = :movementType)
                    """,
            countQuery = """
                    SELECT COUNT(m)
                    FROM StockMovement m
                    WHERE (:fromTime IS NULL OR m.movementDate >= :fromTime)
                      AND (:toTime IS NULL OR m.movementDate < :toTime)
                      AND (:productId IS NULL OR m.product.productId = :productId)
                      AND (:movementType IS NULL OR m.movementType = :movementType)
                    """)
    Page<StockMovement> findMovements(
            @Param("fromTime") LocalDateTime fromTime,
            @Param("toTime") LocalDateTime toTime,
            @Param("productId") Long productId,
            @Param("movementType") MovementType movementType,
            Pageable pageable);
}
