package com.simd.reports;

import com.simd.product.Product;
import com.simd.product.ProductRepository;
import com.simd.sales.Sale;
import com.simd.sales.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

/** Read-only data model used by the Reports screen. */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    @GetMapping
    public ReportResponse getReport() {
        List<Product> products = productRepository.findByActiveTrue();
        List<ReportSale> sales = saleRepository.findAll().stream()
                .map(ReportSale::from)
                .toList();

        double revenue = sales.stream().mapToDouble(sale -> safe(sale.totalAmount())).sum();
        double stockValue = products.stream()
                .mapToDouble(product -> safe(product.getCostPrice()) * safe(product.getStockQuantity()))
                .sum();
        long lowStockItems = products.stream()
                .filter(product -> safe(product.getStockQuantity()) <= safe(product.getLowStockThreshold()))
                .count();

        return new ReportResponse(
                new ReportSummary(revenue, sales.size(), products.size(), lowStockItems, stockValue),
                products,
                sales
        );
    }

    private static double safe(Number value) {
        return value == null ? 0 : value.doubleValue();
    }

    public record ReportResponse(ReportSummary summary, List<Product> products, List<ReportSale> sales) { }

    public record ReportSummary(double totalRevenue, long totalOrders, long activeProducts,
                                long lowStockItems, double stockValue) { }

    /** Avoid serialising Sale.items, which is a lazy JPA relationship. */
    public record ReportSale(Long id, String invoiceNumber, String customerName, String customerPhone,
                             Double subtotal, Double taxAmount, Double totalAmount,
                             String paymentStatus, LocalDateTime saleDate) {
        static ReportSale from(Sale sale) {
            return new ReportSale(sale.getId(), sale.getInvoiceNumber(), sale.getCustomerName(),
                    sale.getCustomerPhone(), sale.getSubtotal(), sale.getTaxAmount(),
                    sale.getTotalAmount(), sale.getPaymentStatus(), sale.getSaleDate());
        }
    }
}
