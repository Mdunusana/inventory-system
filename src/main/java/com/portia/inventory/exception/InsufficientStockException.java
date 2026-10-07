package com.portia.inventory.exception;

/**
 * Thrown when a stock movement would
 * cause product stock to fall below zero.
 */
public class InsufficientStockException extends ConflictException {

    public InsufficientStockException(String message) {
        super(message);
    }
}