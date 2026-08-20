//package com.simd.product;
//
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import java.util.List;
//
//public interface ProductRepository extends JpaRepository<Product, Long> {
//    List<Product> findByStockQuantityLessThanEqual(Integer threshold);
//    List<Product> findByActiveTrue();
//    @Query("SELECT COUNT(p) FROM Product p WHERE p.stockQuantity <= p.lowStockThreshold")
//	Long countLowStockProducts();
//	Long countByActiveTrue();
//}



package com.simd.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrue();

    Long countByActiveTrue();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stockQuantity <= p.lowStockThreshold")
    Long countLowStockProducts();
}