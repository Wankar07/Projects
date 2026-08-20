package com.simd.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {

    List<InventoryTransaction> findTop10ByOrderByCreatedAtDesc();

    List<InventoryTransaction> findByProductIdOrderByCreatedAtDesc(Long productId);
}