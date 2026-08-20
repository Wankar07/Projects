package com.simd.sales;

import com.simd.product.Product;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Product product;

    private Integer quantity;
    private Double unitPrice;
    private Double lineTotal;

    @ManyToOne
    @JoinColumn(name = "sale_id")
    @JsonIgnore
    private Sale sale;
}