package com.portia.inventory.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.portia.inventory.dto.DashboardResponse;
import com.portia.inventory.repository.ProductRepository;

@Service
public class DashboardService {

    private final ProductRepository productRepository;

    public DashboardService(
            ProductRepository productRepository) {

        this.productRepository = productRepository;
    }

    public DashboardResponse getDashboard() {

        long totalProducts = productRepository.count();

        return new DashboardResponse(
                totalProducts,
                0,
                0,
                BigDecimal.ZERO,
                BigDecimal.ZERO);
    }
}