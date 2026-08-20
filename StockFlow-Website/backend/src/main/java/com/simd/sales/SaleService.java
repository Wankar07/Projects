package com.simd.sales;

import com.simd.inventory.InventoryService;
import com.simd.product.Product;
import com.simd.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    public List<Sale> getRecentSales() {
        return saleRepository.findTop5ByOrderBySaleDateDesc();
    }

    public Sale createSale(SaleRequest request) {
        Sale sale = new Sale();
        sale.setCustomerName(request.getCustomerName());
        sale.setCustomerPhone(request.getCustomerPhone());
        sale.setPaymentStatus(
                request.getPaymentStatus() == null ? "PAID" : request.getPaymentStatus()
        );
        sale.setSaleDate(LocalDateTime.now());
        sale.setInvoiceNumber("INV-" + System.currentTimeMillis());

        List<SaleItem> saleItems = new ArrayList<>();
        double subtotal = 0.0;

        for (SaleItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for " + product.getName());
            }

            double lineTotal = product.getSellingPrice() * itemRequest.getQuantity();
            subtotal += lineTotal;

            SaleItem saleItem = SaleItem.builder()
                    .sale(sale)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(product.getSellingPrice())
                    .lineTotal(lineTotal)
                    .build();

            saleItems.add(saleItem);

            inventoryService.stockOut(
                    product.getId(),
                    itemRequest.getQuantity(),
                    "Sale invoice generated"
            );
        }

        double taxAmount = subtotal * 0.18;
        double totalAmount = subtotal + taxAmount;

        sale.setSubtotal(subtotal);
        sale.setTaxAmount(taxAmount);
        sale.setTotalAmount(totalAmount);
        sale.setItems(saleItems);

        return saleRepository.save(sale);
    }
}