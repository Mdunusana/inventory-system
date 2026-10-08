package com.portia.inventory.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.portia.inventory.dto.PageResponse;
import com.portia.inventory.dto.SaleRequest;
import com.portia.inventory.dto.SaleResponse;
import com.portia.inventory.dto.SaleSummaryResponse;
import com.portia.inventory.service.SaleService;

import jakarta.validation.Valid;

/**
 * HTTP endpoints for sales.
 * There is no update or delete: a recorded sale is history.
 */
@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping
    public ResponseEntity<SaleResponse> recordSale(
            @Valid @RequestBody SaleRequest request) {

        SaleResponse created = saleService.recordSale(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.saleId())
                .toUri();

        return ResponseEntity
                .created(location)
                .body(created);
    }

    /**
     * GET /api/sales?page=0&size=20
     * (newest first)
     */
    @GetMapping
    public PageResponse<SaleSummaryResponse> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return saleService.findAll(page, size);
    }

    @GetMapping("/{id}")
    public SaleResponse getById(
            @PathVariable Long id) {

        return saleService.findById(id);
    }
}