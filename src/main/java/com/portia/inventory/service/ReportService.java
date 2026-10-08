package com.portia.inventory.service;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portia.inventory.dto.BestSellingRow;
import com.portia.inventory.dto.PageResponse;
import com.portia.inventory.dto.ReportResponse;
import com.portia.inventory.dto.SlowMovingRow;
import com.portia.inventory.dto.StockLevelResponse;
import com.portia.inventory.dto.StockMovementRow;
import com.portia.inventory.entity.MovementType;
import com.portia.inventory.entity.Product;
import com.portia.inventory.entity.StockMovement;
import com.portia.inventory.exception.InvalidRequestException;
import com.portia.inventory.repository.ReportRepository;
import com.portia.inventory.repository.ReportRepository.BestSellingProjection;
import com.portia.inventory.repository.ReportRepository.SalesTotalProjection;

@Service
public class ReportService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_BEST_SELLING = 50;
    private static final int MAX_DAYS = 365;

    private final ReportRepository reportRepository;
    private final InventoryService inventoryService;
    private final Clock clock;

    public ReportService(
            ReportRepository reportRepository,
            InventoryService inventoryService,
            Clock clock) {

        this.reportRepository = reportRepository;
        this.inventoryService = inventoryService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public PageResponse<StockLevelResponse> inventoryReport(
            Long categoryId,
            int page,
            int size) {

        return inventoryService.getStockLevels(
                null,
                categoryId,
                true,
                null,
                page,
                size);
    }

    @Transactional(readOnly = true)
    public PageResponse<StockLevelResponse> lowStockReport(
            int page,
            int size) {

        return inventoryService.getLowStock(page, size);
    }

    @Transactional(readOnly = true)
    public ReportResponse<BestSellingRow> bestSelling(
            LocalDate from,
            LocalDate to,
            int limit) {

        LocalDate end =
                (to != null)
                        ? to
                        : LocalDate.now(clock);

        LocalDate start =
                (from != null)
                        ? from
                        : end.minusDays(29);

        if (start.isAfter(end)) {
            throw new InvalidRequestException(
                    "'from' must not be after 'to'");
        }

        int safeLimit =
                Math.min(
                        Math.max(limit, 1),
                        MAX_BEST_SELLING);

        List<BestSellingProjection> data =
                reportRepository.findBestSelling(
                        start.atStartOfDay(),
                        end.plusDays(1).atStartOfDay(),
                        PageRequest.of(0, safeLimit));

        List<BestSellingRow> rows = new ArrayList<>();

        for (int i = 0; i < data.size(); i++) {

            BestSellingProjection d = data.get(i);

            rows.add(
                    new BestSellingRow(
                            i + 1,
                            d.getProductId(),
                            d.getProductCode(),
                            d.getProductName(),
                            d.getUnitsSold(),
                            d.getRevenue()));
        }

        Map<String, String> parameters =
                new LinkedHashMap<>();

        parameters.put("from", start.toString());
        parameters.put("to", end.toString());
        parameters.put("limit", String.valueOf(safeLimit));

        return new ReportResponse<>(
                "Best-selling products",
                LocalDateTime.now(clock),
                parameters,
                rows);
    }

    @Transactional(readOnly = true)
    public ReportResponse<SlowMovingRow> slowMoving(
            int days,
            int threshold) {

        int safeDays =
                Math.min(
                        Math.max(days, 1),
                        MAX_DAYS);

        int safeThreshold =
                Math.max(threshold, 1);

        LocalDateTime now =
                LocalDateTime.now(clock);

        LocalDateTime since =
                now.minusDays(safeDays);

        List<Product> candidates =
                reportRepository.findSlowMovingCandidates(since);

        Map<Long, SalesTotalProjection> totals =
                new HashMap<>();

        for (SalesTotalProjection total :
                reportRepository.findSalesTotals(since)) {

            totals.put(
                    total.getProductId(),
                    total);
        }

        List<SlowMovingRow> rows =
                new ArrayList<>();

        for (Product product : candidates) {

            SalesTotalProjection total =
                    totals.get(product.getProductId());

            long unitsSold =
                    (total == null || total.getUnitsSold() == null)
                            ? 0
                            : total.getUnitsSold();

            if (unitsSold < safeThreshold) {

                rows.add(
                        new SlowMovingRow(
                                product.getProductId(),
                                product.getProductCode(),
                                product.getProductName(),
                                product.getCategory()
                                        .getCategoryName(),
                                product.getCurrentStock(),
                                unitsSold,
                                total == null
                                        ? null
                                        : total.getLastSaleDate()));
            }
        }

        rows.sort(
                Comparator.comparingLong(
                                SlowMovingRow::unitsSold)
                        .thenComparing(
                                SlowMovingRow::currentStock,
                                Comparator.reverseOrder())
                        .thenComparing(
                                SlowMovingRow::productName));

        Map<String, String> parameters =
                new LinkedHashMap<>();

        parameters.put("days", String.valueOf(safeDays));
        parameters.put("soldFewerThan",
                String.valueOf(safeThreshold));
        parameters.put("asOf", now.toString());

        return new ReportResponse<>(
                "Slow-moving products",
                now,
                parameters,
                rows);
    }

    @Transactional(readOnly = true)
    public PageResponse<StockMovementRow> movements(
            LocalDate from,
            LocalDate to,
            Long productId,
            MovementType type,
            int page,
            int size) {

        if (from != null
                && to != null
                && from.isAfter(to)) {

            throw new InvalidRequestException(
                    "'from' must not be after 'to'");
        }

        LocalDateTime fromTime =
                (from == null)
                        ? null
                        : from.atStartOfDay();

        LocalDateTime toTime =
                (to == null)
                        ? null
                        : to.plusDays(1).atStartOfDay();

        Pageable pageable =
                PageRequest.of(
                        Math.max(page, 0),
                        Math.min(
                                Math.max(size, 1),
                                MAX_PAGE_SIZE),
                        Sort.by(
                                Sort.Direction.DESC,
                                "movementDate",
                                "stockMovementId"));

        Page<StockMovement> result =
                reportRepository.findMovements(
                        fromTime,
                        toTime,
                        productId,
                        type,
                        pageable);

        return PageResponse.from(
                result.map(StockMovementRow::from));
    }
}
