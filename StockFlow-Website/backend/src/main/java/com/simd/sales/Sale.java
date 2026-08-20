package com.simd.sales;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String invoiceNumber;
    private String customerName;
    private String customerPhone;

    private Double subtotal;
    private Double taxAmount;
    private Double totalAmount;

    private String paymentStatus; // PAID, PENDING, CANCELLED

    private LocalDateTime saleDate;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SaleItem> items = new ArrayList<>();
}
