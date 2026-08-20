package com.simd.inventory;

import com.simd.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final InventoryTransactionRepository transactionRepository;
    private final ProductRepository productRepository;

    /** A single read model for the Inventory screen. */
    @GetMapping
    public Map<String, Object> getInventoryOverview() {
        return Map.of(
                "products", productRepository.findByActiveTrue(),
                "transactions", transactionRepository.findTop10ByOrderByCreatedAtDesc()
        );
    }

    @GetMapping("/transactions")
    public List<InventoryTransaction> getTransactions() {
        return transactionRepository.findTop10ByOrderByCreatedAtDesc();
    }

    @PostMapping("/stock-in")
    public Map<String, Object> stockIn(@RequestBody Map<String, Object> request) {
        Long productId = Long.valueOf(request.get("productId").toString());
        Integer quantity = Integer.valueOf(request.get("quantity").toString());
        String note = request.getOrDefault("note", "Stock added").toString();

        InventoryTransaction transaction = inventoryService.stockIn(productId, quantity, note);

        return Map.of(
                "message", "Stock added successfully",
                "transactionId", transaction.getId(),
                "productId", transaction.getProduct().getId(),
                "type", transaction.getType(),
                "quantity", transaction.getQuantity(),
                "note", transaction.getNote(),
                "createdAt", transaction.getCreatedAt()
        );
    }

    @PostMapping("/stock-out")
    public Map<String, Object> stockOut(@RequestBody Map<String, Object> request) {
        Long productId = Long.valueOf(request.get("productId").toString());
        Integer quantity = Integer.valueOf(request.get("quantity").toString());
        String note = request.getOrDefault("note", "Stock removed").toString();

        InventoryTransaction transaction = inventoryService.stockOut(productId, quantity, note);

        return Map.of(
                "message", "Stock removed successfully",
                "transactionId", transaction.getId(),
                "productId", transaction.getProduct().getId(),
                "type", transaction.getType(),
                "quantity", transaction.getQuantity(),
                "note", transaction.getNote(),
                "createdAt", transaction.getCreatedAt()
        );
    }
}
