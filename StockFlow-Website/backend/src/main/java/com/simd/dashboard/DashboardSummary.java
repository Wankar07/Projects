package com.simd.dashboard;

public record DashboardSummary(
        Double totalRevenue,
        Long totalOrders,
        Long lowStockItems,
        Long activeProducts
) {}