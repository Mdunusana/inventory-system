package com.portia.inventory.service;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portia.inventory.dto.DashboardResponse;
import com.portia.inventory.repository.ProductRepository;
import com.portia.inventory.repository.SaleRepository;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final Clock clock;

    public DashboardService(
            ProductRepository productRepository,
            SaleRepository saleRepository,
            Clock clock) {

        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {

        long ok = productRepository.countActiveInStock();
        long low = productRepository.countActiveLowStock();
        long out = productRepository.countActiveOutOfStock();

        // "Today" = from midnight until the next midnight
        LocalDateTime startOfToday = LocalDate.now(clock).atStartOfDay();
        LocalDateTime startOfTomorrow = startOfToday.plusDays(1);

        return new DashboardResponse(
                ok + low + out,
                ok,
                low,
                out,
                productRepository.sumActiveUnitsInStock(),
                orZero(productRepository.sumActiveInventoryValue()),
                saleRepository.countSalesBetween(startOfToday, startOfTomorrow),
                orZero(saleRepository.sumSalesBetween(startOfToday, startOfTomorrow)));
    }

    // SUM returns null when there are no rows (e.g. no sales yet today)
    private BigDecimal orZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}