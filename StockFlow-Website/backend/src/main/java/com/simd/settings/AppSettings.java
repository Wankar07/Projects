package com.simd.settings;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "system_setting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppSettings {
    @Id
    private Long id;
    private String companyName;
    private String gstin;
    private String phone;
    private String address;
    private Integer lowStockThreshold;
    private Integer criticalStockThreshold;
    private Integer reorderLeadDays;
    private Double defaultGst;
    private Boolean emailLowStock;
}
