package com.simd.sales;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    @EntityGraph(attributePaths = {"items", "items.product"})
    List<Sale> findTop5ByOrderBySaleDateDesc();

    @Override
    @EntityGraph(attributePaths = {"items", "items.product"})
    List<Sale> findAll();

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0.0) FROM Sale s")
    Double getTotalRevenue();
}
