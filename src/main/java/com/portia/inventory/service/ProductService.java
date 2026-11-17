package com.portia.inventory.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portia.inventory.dto.PageResponse;
import com.portia.inventory.dto.ProductRequest;
import com.portia.inventory.dto.ProductResponse;
import com.portia.inventory.entity.Category;
import com.portia.inventory.entity.Product;
import com.portia.inventory.exception.ConflictException;
import com.portia.inventory.exception.InvalidRequestException;
import com.portia.inventory.exception.ResourceNotFoundException;
import com.portia.inventory.repository.CategoryRepository;
import com.portia.inventory.repository.ProductRepository;

@Service
public class ProductService {

    private static final int MAX_PAGE_SIZE = 100;

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    // 1. Search / list products, one page at a time
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> search(
            String search,
            Long categoryId,
            Boolean active,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
                Sort.by("productName"));

        // An empty search box means "no filter"
        String cleanSearch =
                (search == null || search.isBlank()) ? null : search.trim();

        return PageResponse.from(
                productRepository
                        .search(cleanSearch, categoryId, active, pageable)
                        .map(ProductResponse::from));
    }

    // 2. Find one product
    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        return ProductResponse.from(getProduct(id));
    }

    // 3. Create a product (starts with 0 stock)
    @Transactional
    public ProductResponse create(ProductRequest request) {
        String code = request.productCode().trim();

        if (productRepository.existsByProductCodeIgnoreCase(code)) {
            throw new ConflictException(
                    "A product with code '" + code + "' already exists");
        }

        Product product = new Product(
                code,
                request.productName().trim(),
                cleanDescription(request.description()),
                getCategory(request.categoryId()),
                request.price(),
                request.minimumStockLevel());

        return ProductResponse.from(productRepository.save(product));
    }

    // 4. Edit a product's details (not its stock)
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getProduct(id);
        String code = request.productCode().trim();

        if (productRepository
                .existsByProductCodeIgnoreCaseAndProductIdNot(code, id)) {
            throw new ConflictException(
                    "A product with code '" + code + "' already exists");
        }

        product.updateDetails(
                code,
                request.productName().trim(),
                cleanDescription(request.description()),
                getCategory(request.categoryId()),
                request.price(),
                request.minimumStockLevel());

        return ProductResponse.from(product);
    }

    // 5a. Deactivate (hide from new sales, keep history)
    @Transactional
    public ProductResponse deactivate(Long id) {
        Product product = getProduct(id);
        product.deactivate();
        return ProductResponse.from(product);
    }

    // 5b. Activate again
    @Transactional
    public ProductResponse activate(Long id) {
        Product product = getProduct(id);
        product.activate();
        return ProductResponse.from(product);
    }

    // ---------- Helpers ----------

    private Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product " + id + " not found"));
    }

    private Category getCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new InvalidRequestException(
                        "Category " + categoryId + " does not exist"));
    }

    private String cleanDescription(String description) {
        return (description == null || description.isBlank())
                ? null
                : description.trim();
    }
}