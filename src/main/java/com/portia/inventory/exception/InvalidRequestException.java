package com.portia.inventory.exception;

/**
 * Thrown when a request is valid JSON
 * but violates business rules.
 */
public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }
}