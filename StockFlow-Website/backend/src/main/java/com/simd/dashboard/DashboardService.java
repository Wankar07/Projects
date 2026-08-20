package com.simd.dashboard;

import com.simd.product.ProductRepository;
import com.simd.sales.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;

    public DashboardSummary getSummary() {
        Double totalRevenue = saleRepository.getTotalRevenue();
        Long totalOrders = saleRepository.count();
        Long lowStockItems = productRepository.countLowStockProducts();
        Long activeProducts = productRepository.countByActiveTrue();

        return new DashboardSummary(
                totalRevenue == null ? 0.0 : totalRevenue,
                totalOrders,
                lowStockItems,
                activeProducts
        );
    }
}