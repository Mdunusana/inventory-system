package com.portia.inventory.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portia.inventory.dto.AdjustStockRequest;
import com.portia.inventory.dto.ReceiveStockRequest;
import com.portia.inventory.dto.StockChangeResponse;
import com.portia.inventory.entity.MovementType;
import com.portia.inventory.entity.Product;
import com.portia.inventory.entity.StockMovement;
import com.portia.inventory.entity.User;
import com.portia.inventory.exception.InvalidRequestException;
import com.portia.inventory.exception.ResourceNotFoundException;
import com.portia.inventory.repository.ProductRepository;
import com.portia.inventory.repository.StockMovementRepository;

@Service
public class StockService {

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    private final CurrentUserService currentUserService;

    public StockService(
            ProductRepository productRepository,
            StockMovementRepository stockMovementRepository,
            CurrentUserService currentUserService) {

        this.productRepository = productRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public StockChangeResponse receiveStock(
            ReceiveStockRequest request) {

        Product product = getProductOrThrow(
                request.productId());

        int previousStock = product.getCurrentStock();

        product.changeStock(request.quantity());

        User user = currentUserService.getCurrentUser();

        StockMovement movement =
                new StockMovement(
                        product,
                        user,
                        null,
                        MovementType.RECEIVED,
                        request.quantity(),
                        request.reference(),
                        "Stock received");

        stockMovementRepository.save(movement);

        return new StockChangeResponse(
                product.getProductId(),
                product.getProductCode(),
                product.getProductName(),
                MovementType.RECEIVED,
                request.quantity(),
                previousStock,
                product.getCurrentStock(),
                product.getStockStatus(),
                request.reference(),
                "Stock received");
    }

    @Transactional
    public StockChangeResponse adjustStock(
            AdjustStockRequest request) {

        if (request.quantityChange() == 0) {
            throw new InvalidRequestException(
                    "Quantity change cannot be zero");
        }

        Product product = getProductOrThrow(
                request.productId());

        int previousStock = product.getCurrentStock();

        product.changeStock(request.quantityChange());

        User user = currentUserService.getCurrentUser();

        StockMovement movement =
                new StockMovement(
                        product,
                        user,
                        null,
                        MovementType.ADJUSTMENT,
                        request.quantityChange(),
                        null,
                        request.reason());

        stockMovementRepository.save(movement);

        return new StockChangeResponse(
                product.getProductId(),
                product.getProductCode(),
                product.getProductName(),
                MovementType.ADJUSTMENT,
                request.quantityChange(),
                previousStock,
                product.getCurrentStock(),
                product.getStockStatus(),
                null,
                request.reason());
    }

    private Product getProductOrThrow(Long productId) {

        return productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found: "
                                        + productId));
    }
}