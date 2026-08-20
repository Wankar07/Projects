package com.simd.sales;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @GetMapping
    public List<Sale> getSales() {
        return saleService.getAllSales();
    }

    @GetMapping("/recent")
    public List<Sale> getRecentSales() {
        return saleService.getRecentSales();
    }

    @PostMapping
    public Sale createSale(@RequestBody SaleRequest request) {
        return saleService.createSale(request);
    }
}
