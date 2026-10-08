package com.portia.inventory.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

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
}