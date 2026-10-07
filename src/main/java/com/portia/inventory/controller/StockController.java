package com.portia.inventory.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.portia.inventory.dto.AdjustStockRequest;
import com.portia.inventory.dto.ReceiveStockRequest;
import com.portia.inventory.dto.StockChangeResponse;
import com.portia.inventory.service.StockService;

import jakarta.validation.Valid;

/**
 * HTTP endpoints for stock transactions.
 * Each call creates a stock movement.
 */
@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @PostMapping("/receive")
    @ResponseStatus(HttpStatus.CREATED)
    public StockChangeResponse receive(
            @Valid @RequestBody ReceiveStockRequest request) {

        return stockService.receiveStock(request);
    }

    @PostMapping("/adjust")
    @ResponseStatus(HttpStatus.CREATED)
    public StockChangeResponse adjust(
            @Valid @RequestBody AdjustStockRequest request) {

        return stockService.adjustStock(request);
    }
}