package com.portia.inventory.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.portia.inventory.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByCategoryNameIgnoreCase(String categoryName);

    boolean existsByCategoryNameIgnoreCaseAndCategoryIdNot(
            String categoryName,
            Long categoryId);

    Optional<Category> findByCategoryNameIgnoreCase(String categoryName);
}
