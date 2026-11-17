package com.portia.inventory.entity;

/**
 * Why stock changed.
 * The quantity's sign (+ or -)
 * says in which direction.
 */
public enum MovementType {

    RECEIVED,

    SALE,

    ADJUSTMENT
}