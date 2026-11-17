package com.portia.inventory.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.portia.inventory.entity.Sale;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    /**
     * One sale with everything needed to display it
     * (user, items and their products) in a single query.
     */
    @Override
    @EntityGraph(attributePaths = {
            "user",
            "items",
            "items.product"
    })
    Optional<Sale> findById(Long id);

    /**
     * The sales list needs only the user, not the items.
     */
    @Override
    @EntityGraph(attributePaths = "user")
    Page<Sale> findAll(Pageable pageable);

    /** How many sales happened between two moments (used for "today"). */
    @Query("SELECT COUNT(s) FROM Sale s WHERE s.saleDate >= :from AND s.saleDate < :to")
    long countSalesBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    /** Total Rand value of sales between two moments. Null if there were none. */
    @Query("SELECT SUM(s.totalAmount) FROM Sale s WHERE s.saleDate >= :from AND s.saleDate < :to")
    BigDecimal sumSalesBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}