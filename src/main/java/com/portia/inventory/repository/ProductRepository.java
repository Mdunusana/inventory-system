package com.portia.inventory.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.portia.inventory.entity.Product;

import jakarta.persistence.LockModeType;

public interface ProductRepository extends JpaRepository<Product, Long> {

    String COND_OUT_OF_STOCK = "p.currentStock <= 0";
    String COND_LOW_STOCK =
            "(p.currentStock > 0 AND p.currentStock <= p.minimumStockLevel)";
    String COND_IN_STOCK =
            "p.currentStock > p.minimumStockLevel";

    String COND_NEEDS_ATTENTION =
            "p.currentStock <= p.minimumStockLevel";

    boolean existsByProductCodeIgnoreCase(String productCode);

    boolean existsByProductCodeIgnoreCaseAndProductIdNot(
            String productCode,
            Long productId);

    boolean existsByCategory_CategoryId(Long categoryId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.productId = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

    @EntityGraph(attributePaths = "category")
    @Query("""
            SELECT p FROM Product p
            WHERE (:search IS NULL
                   OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.productCode) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:categoryId IS NULL OR p.category.categoryId = :categoryId)
              AND (:active IS NULL OR p.active = :active)
            """)
    Page<Product> search(
            @Param("search") String search,
            @Param("categoryId") Long categoryId,
            @Param("active") Boolean active,
            Pageable pageable);

    @EntityGraph(attributePaths = "category")
    @Query("SELECT p FROM Product p "
            + "WHERE (:search IS NULL "
            + "OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR LOWER(p.productCode) LIKE LOWER(CONCAT('%', :search, '%'))) "
            + "AND (:categoryId IS NULL OR p.category.categoryId = :categoryId) "
            + "AND (:active IS NULL OR p.active = :active) "
            + "AND (:status IS NULL "
            + "OR (:status = 'OUT_OF_STOCK' AND " + COND_OUT_OF_STOCK + ") "
            + "OR (:status = 'LOW_STOCK' AND " + COND_LOW_STOCK + ") "
            + "OR (:status = 'OK' AND " + COND_IN_STOCK + "))")
    Page<Product> findStockLevels(
            @Param("search") String search,
            @Param("categoryId") Long categoryId,
            @Param("active") Boolean active,
            @Param("status") String status,
            Pageable pageable);

    @EntityGraph(attributePaths = "category")
    @Query(
            value = "SELECT p FROM Product p WHERE p.active = true AND "
                    + COND_NEEDS_ATTENTION
                    + " ORDER BY (p.currentStock - p.minimumStockLevel) ASC, p.productName ASC",
            countQuery = "SELECT COUNT(p) FROM Product p WHERE p.active = true AND "
                    + COND_NEEDS_ATTENTION)
    Page<Product> findLowStock(Pageable pageable);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true AND "
            + COND_IN_STOCK)
    long countActiveInStock();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true AND "
            + COND_LOW_STOCK)
    long countActiveLowStock();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true AND "
            + COND_OUT_OF_STOCK)
    long countActiveOutOfStock();

    @Query(
            "SELECT COALESCE(SUM(p.currentStock), 0L) FROM Product p WHERE p.active = true")
    long sumActiveUnitsInStock();
}