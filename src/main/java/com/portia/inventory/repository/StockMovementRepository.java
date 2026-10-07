package com.portia.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.portia.inventory.entity.StockMovement;

/**
 * Movements are only ever added.
 * Reports that read them arrive in Phase 11.
 */
public interface StockMovementRepository
        extends JpaRepository<StockMovement, Long> {
}