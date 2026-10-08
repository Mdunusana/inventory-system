package com.portia.inventory.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.portia.inventory.dto.BestSellingRow;
import com.portia.inventory.dto.PageResponse;
import com.portia.inventory.dto.ReportResponse;
import com.portia.inventory.dto.SlowMovingRow;
import com.portia.inventory.dto.StockLevelResponse;
import com.portia.inventory.dto.StockMovementRow;
import com.portia.inventory.entity.MovementType;
import com.portia.inventory.service.ReportService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/inventory")
    public PageResponse<StockLevelResponse> inventory(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return reportService.inventoryReport(
                categoryId,
                page,
                size);
    }

    @GetMapping("/low-stock")
    public PageResponse<StockLevelResponse> lowStock(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return reportService.lowStockReport(
                page,
                size);
    }

    @GetMapping("/best-selling")
    public ReportResponse<BestSellingRow> bestSelling(
            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE)
            LocalDate to,

            @RequestParam(defaultValue = "10")
            int limit) {

        return reportService.bestSelling(
                from,
                to,
                limit);
    }

    @GetMapping("/slow-moving")
    public ReportResponse<SlowMovingRow> slowMoving(
            @RequestParam(defaultValue = "30")
            int days,

            @RequestParam(defaultValue = "5")
            int threshold) {

        return reportService.slowMoving(
                days,
                threshold);
    }

    @GetMapping("/stock-movements")
    public PageResponse<StockMovementRow> stockMovements(

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE)
            LocalDate to,

            @RequestParam(required = false)
            Long productId,

            @RequestParam(required = false)
            MovementType type,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size) {

        return reportService.movements(
                from,
                to,
                productId,
                type,
                page,
                size);
    }
}
