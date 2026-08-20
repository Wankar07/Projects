package com.simd.inventory;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.simd.product.Product;
import com.simd.product.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final InventoryTransactionRepository transactionRepository;

    public InventoryTransaction stockIn(Long productId, Integer quantity, String note) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);

        return transactionRepository.save(
                InventoryTransaction.builder()
                        .product(product)
                        .type("STOCK_IN")
                        .quantity(quantity)
                        .note(note)
                        .createdAt(LocalDateTime.now())
                        .build()
        );
    }

    public InventoryTransaction stockOut(Long productId, Integer quantity, String note) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);

        return transactionRepository.save(
                InventoryTransaction.builder()
                        .product(product)
                        .type("STOCK_OUT")
                        .quantity(quantity)
                        .note(note)
                        .createdAt(LocalDateTime.now())
                        .build()
        );
    }
}