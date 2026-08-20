package com.simd.sales;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SaleItemRequest {

    private Long productId;
    private Integer quantity;
}