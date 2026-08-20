package com.simd.product;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sku;
    private String name;
    private String category;

    private Double sellingPrice;
    private Double costPrice;

    private Integer stockQuantity;
    private Integer lowStockThreshold;

    private Boolean active;
}