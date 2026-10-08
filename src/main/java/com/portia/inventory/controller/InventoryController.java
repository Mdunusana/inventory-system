package com.portia.inventory.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.portia.inventory.dto.PageResponse;
import com.portia.inventory.dto.StockLevelResponse;
import com.portia.inventory.dto.StockSummaryResponse;
import com.portia.inventory.entity.StockStatus;
import com.portia.inventory.service.InventoryService;

@RestController
@RequestMapping("/api/stock")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public PageResponse<StockLevelResponse> getStockLevels(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) StockStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return inventoryService.getStockLevels(
                search,
                categoryId,
                active,
                status,
                page,
                size);
    }

    @GetMapping("/low")
    public PageResponse<StockLevelResponse> getLowStock(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return inventoryService.getLowStock(page, size);
    }

    @GetMapping("/summary")
    public StockSummaryResponse getSummary() {
        return inventoryService.getSummary();
    }
}