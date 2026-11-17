package com.portia.inventory.service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portia.inventory.dto.PageResponse;
import com.portia.inventory.dto.SaleItemRequest;
import com.portia.inventory.dto.SaleRequest;
import com.portia.inventory.dto.SaleResponse;
import com.portia.inventory.dto.SaleSummaryResponse;
import com.portia.inventory.entity.MovementType;
import com.portia.inventory.entity.Product;
import com.portia.inventory.entity.Sale;
import com.portia.inventory.entity.StockMovement;
import com.portia.inventory.entity.User;
import com.portia.inventory.exception.ConflictException;
import com.portia.inventory.exception.InsufficientStockException;
import com.portia.inventory.exception.InvalidRequestException;
import com.portia.inventory.exception.ResourceNotFoundException;
import com.portia.inventory.repository.ProductRepository;
import com.portia.inventory.repository.SaleRepository;
import com.portia.inventory.repository.StockMovementRepository;

@Service
public class SaleService {

    private static final int MAX_PAGE_SIZE = 100;

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    private final CurrentUserService currentUserService;

    public SaleService(
            SaleRepository saleRepository,
            ProductRepository productRepository,
            StockMovementRepository stockMovementRepository,
            CurrentUserService currentUserService) {

        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public SaleResponse recordSale(SaleRequest request) {

        if (request.items() == null || request.items().isEmpty()) {
            throw new InvalidRequestException(
                    "A sale must contain at least one item");
        }

        // Combine duplicate lines. TreeMap keeps product IDs in order,
        // so products are always locked in the same order (no deadlocks).
        Map<Long, Integer> quantities = new TreeMap<>();

        for (SaleItemRequest item : request.items()) {
            quantities.merge(
                    item.productId(),
                    item.quantity(),
                    Integer::sum);
        }

        User user = currentUserService.getCurrentUser();

        Map<Long, Product> products = new LinkedHashMap<>();

        for (Map.Entry<Long, Integer> line : quantities.entrySet()) {

            // LOCK the product row until this sale finishes,
            // so two sales can never sell the same last item.
            Product product = productRepository
                    .findByIdForUpdate(line.getKey())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Product not found: "
                                            + line.getKey()));

            if (!product.isActive()) {
                throw new ConflictException(
                        "Product "
                                + product.getProductCode()
                                + " is deactivated and cannot be sold");
            }

            if (product.getCurrentStock() < line.getValue()) {
                throw new InsufficientStockException(
                        "Insufficient stock for "
                                + product.getProductCode()
                                + " (only "
                                + product.getCurrentStock()
                                + " left)");
            }

            products.put(line.getKey(), product);
        }

        Sale sale = new Sale(user);

        for (Map.Entry<Long, Integer> line : quantities.entrySet()) {

            sale.addItem(
                    products.get(line.getKey()),
                    line.getValue());

            // Reduce stock immediately
            products.get(line.getKey())
                    .changeStock(-line.getValue());
        }

        Sale savedSale = saleRepository.save(sale);

        // Log one SALE movement per product (the audit trail).
        // Needs the saved sale's ID, so this happens after save().
        for (Map.Entry<Long, Integer> line : quantities.entrySet()) {

            stockMovementRepository.save(
                    new StockMovement(
                            products.get(line.getKey()),
                            user,
                            savedSale.getSaleId(),
                            MovementType.SALE,
                            -line.getValue(),
                            null,
                            null));
        }

        return SaleResponse.from(savedSale);
    }

    @Transactional(readOnly = true)
    public PageResponse<SaleSummaryResponse> findAll(
            int page,
            int size) {

        int safePage = Math.max(page, 0);
        int safeSize =
                Math.min(
                        Math.max(size, 1),
                        MAX_PAGE_SIZE);

        Pageable pageable =
                PageRequest.of(
                        safePage,
                        safeSize,
                        Sort.by(
                                Sort.Direction.DESC,
                                "saleDate",
                                "saleId"));

        Page<Sale> result =
                saleRepository.findAll(pageable);

        return PageResponse.from(
                result.map(SaleSummaryResponse::from));
    }

    @Transactional(readOnly = true)
    public SaleResponse findById(Long id) {

        Sale sale =
                saleRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Sale not found: " + id));

        return SaleResponse.from(sale);
    }
}