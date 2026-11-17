package com.portia.inventory.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portia.inventory.dto.CategoryRequest;
import com.portia.inventory.dto.CategoryResponse;
import com.portia.inventory.entity.Category;
import com.portia.inventory.exception.ConflictException;
import com.portia.inventory.exception.ResourceNotFoundException;
import com.portia.inventory.repository.CategoryRepository;
import com.portia.inventory.repository.ProductRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(
            CategoryRepository categoryRepository,
            ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    // 1. List all categories, A to Z
    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categoryRepository
                .findAll(Sort.by("categoryName"))
                .stream()
                .map(CategoryResponse::from)
                .toList();
    }

    // 2. Find one category
    @Transactional(readOnly = true)
    public CategoryResponse findById(Long id) {
        return CategoryResponse.from(getCategory(id));
    }

    // 3. Create a category
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String name = request.categoryName().trim();

        if (categoryRepository.existsByCategoryNameIgnoreCase(name)) {
            throw new ConflictException(
                    "A category named '" + name + "' already exists");
        }

        Category saved = categoryRepository.save(new Category(name));
        return CategoryResponse.from(saved);
    }

    // 4. Rename a category
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = getCategory(id);
        String name = request.categoryName().trim();

        if (categoryRepository
                .existsByCategoryNameIgnoreCaseAndCategoryIdNot(name, id)) {
            throw new ConflictException(
                    "A category named '" + name + "' already exists");
        }

        category.setCategoryName(name);
        return CategoryResponse.from(category);
    }

    // 5. Delete a category (only if no products use it)
    @Transactional
    public void delete(Long id) {
        Category category = getCategory(id);

        if (productRepository.existsByCategory_CategoryId(id)) {
            throw new ConflictException(
                    "This category still has products and cannot be deleted");
        }

        categoryRepository.delete(category);
    }

    // Helper: load a category or fail with "not found"
    private Category getCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category " + id + " not found"));
    }
}
