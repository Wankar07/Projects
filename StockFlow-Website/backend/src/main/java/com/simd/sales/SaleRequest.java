package com.simd.sales;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SaleRequest {

    private String customerName;
    private String customerPhone;
    private String paymentStatus;
    private List<SaleItemRequest> items;
}