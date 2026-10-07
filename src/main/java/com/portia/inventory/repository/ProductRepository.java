package com.portia.inventory.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.portia.inventory.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByProductCodeIgnoreCase(String productCode);

    boolean existsByProductCodeIgnoreCaseAndProductIdNot(
            String productCode,
            Long productId);

    boolean existsByCategory_CategoryId(Long categoryId);

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
}
