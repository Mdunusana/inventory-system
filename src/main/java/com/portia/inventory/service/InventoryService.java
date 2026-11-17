package com.portia.inventory.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portia.inventory.dto.PageResponse;
import com.portia.inventory.dto.StockLevelResponse;
import com.portia.inventory.dto.StockSummaryResponse;
import com.portia.inventory.entity.Product;
import com.portia.inventory.entity.StockStatus;
import com.portia.inventory.repository.ProductRepository;

/**
 * Read-only views of stock (UC03, UC04, FR08).
 * Nothing here changes data.
 */
@Service
public class InventoryService {

    private static final int MAX_PAGE_SIZE = 100;

    private final ProductRepository productRepository;

    public InventoryService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * UC03: every product with its quantity and status.
     */
    @Transactional(readOnly = true)
    public PageResponse<StockLevelResponse> getStockLevels(
            String search,
            Long categoryId,
            Boolean active,
            StockStatus status,
            int page,
            int size) {

        String term =
                (search == null || search.isBlank())
                        ? null
                        : search.trim();

        String statusName =
                (status == null)
                        ? null
                        : status.name();

        Pageable pageable =
                PageRequest.of(
                        safePage(page),
                        safeSize(size),
                        Sort.by("productName"));

        Page<Product> result =
                productRepository.findStockLevels(
                        term,
                        categoryId,
                        active,
                        statusName,
                        pageable);

        return PageResponse.from(
                result.map(StockLevelResponse::from));
    }

    /**
     * UC04 / FR08: active products at or below minimum stock.
     */
    @Transactional(readOnly = true)
    public PageResponse<StockLevelResponse> getLowStock(
            int page,
            int size) {

        Pageable pageable =
                PageRequest.of(
                        safePage(page),
                        safeSize(size));

        Page<Product> result =
                productRepository.findLowStock(pageable);

        return PageResponse.from(
                result.map(StockLevelResponse::from));
    }

    @Transactional(readOnly = true)
    public StockSummaryResponse getSummary() {

        long ok =
                productRepository.countActiveInStock();

        long low =
                productRepository.countActiveLowStock();

        long out =
                productRepository.countActiveOutOfStock();

        long units =
                productRepository.sumActiveUnitsInStock();

        return new StockSummaryResponse(
                ok + low + out,
                ok,
                low,
                out,
                units);
    }

    private int safePage(int page) {
        return Math.max(page, 0);
    }

    private int safeSize(int size) {
        return Math.min(
                Math.max(size, 1),
                MAX_PAGE_SIZE);
    }
}
