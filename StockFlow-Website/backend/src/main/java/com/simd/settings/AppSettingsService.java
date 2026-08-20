package com.simd.settings;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AppSettingsService {
    private static final long SETTINGS_ID = 1L;
    private final AppSettingsRepository repository;

    @Transactional(readOnly = true)
    public AppSettings get() {
        return repository.findById(SETTINGS_ID).orElseGet(AppSettingsService::defaults);
    }

    @Transactional
    public AppSettings save(AppSettings incoming) {
        AppSettings settings = repository.findById(SETTINGS_ID).orElseGet(AppSettingsService::defaults);
        settings.setCompanyName(incoming.getCompanyName());
        settings.setGstin(incoming.getGstin());
        settings.setPhone(incoming.getPhone());
        settings.setAddress(incoming.getAddress());
        settings.setLowStockThreshold(incoming.getLowStockThreshold());
        settings.setCriticalStockThreshold(incoming.getCriticalStockThreshold());
        settings.setReorderLeadDays(incoming.getReorderLeadDays());
        settings.setDefaultGst(incoming.getDefaultGst());
        settings.setEmailLowStock(incoming.getEmailLowStock());
        validate(settings);
        return repository.save(settings);
    }

    private static void validate(AppSettings settings) {
        if (settings.getCompanyName() == null || settings.getCompanyName().isBlank()) throw new IllegalArgumentException("Company name is required");
        if (settings.getLowStockThreshold() == null || settings.getLowStockThreshold() < 1) throw new IllegalArgumentException("Low stock threshold must be at least 1");
        if (settings.getCriticalStockThreshold() == null || settings.getCriticalStockThreshold() < 0 || settings.getCriticalStockThreshold() > settings.getLowStockThreshold()) throw new IllegalArgumentException("Critical stock threshold must be between 0 and the low stock threshold");
        if (settings.getReorderLeadDays() == null || settings.getReorderLeadDays() < 0) throw new IllegalArgumentException("Reorder lead days cannot be negative");
        if (settings.getDefaultGst() == null || settings.getDefaultGst() < 0 || settings.getDefaultGst() > 100) throw new IllegalArgumentException("Default GST must be between 0 and 100");
    }

    private static AppSettings defaults() {
        return new AppSettings(SETTINGS_ID, "StockFlow Inventory", "", "", "", 10, 5, 7, 18.0, true);
    }
}
