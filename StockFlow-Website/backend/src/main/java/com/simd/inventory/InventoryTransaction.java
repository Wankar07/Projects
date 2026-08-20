package com.simd.inventory;

import com.simd.product.Product;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Product product;

    private String type; // STOCK_IN, STOCK_OUT, ADJUST
    private Integer quantity;
    private String note;
    private LocalDateTime createdAt;
}