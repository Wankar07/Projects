package com.simd;

import com.simd.product.Product;
import com.simd.product.ProductRepository;
import com.simd.product.ProductService;
import com.simd.settings.AppSettings;
import com.simd.settings.AppSettingsRepository;
import com.simd.settings.AppSettingsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import({ProductService.class, AppSettingsService.class})
class PersistenceIntegrationTests {
    @Autowired ProductService productService;
    @Autowired ProductRepository productRepository;
    @Autowired AppSettingsService settingsService;
    @Autowired AppSettingsRepository settingsRepository;

    @Test
    void createdProductIsStoredInDatabase() {
        Product product = Product.builder()
                .sku("TEST-DB-001")
                .name("Database test product")
                .category("Testing")
                .sellingPrice(125.0)
                .costPrice(100.0)
                .stockQuantity(8)
                .lowStockThreshold(2)
                .active(true)
                .build();

        Product saved = productService.createProduct(product);

        assertThat(saved.getId()).isNotNull();
        assertThat(productRepository.findById(saved.getId()))
                .get()
                .extracting(Product::getSku)
                .isEqualTo("TEST-DB-001");
    }

    @Test
    void settingsAreStoredAndReloadedFromDatabase() {
        AppSettings request = new AppSettings(null, "Acme Inventory", "27ABCDE1234F1Z5", "+91 99999 99999",
                "Pune", 12, 4, 6, 18.0, true);

        settingsService.save(request);

        assertThat(settingsRepository.findById(1L)).isPresent();
        assertThat(settingsService.get().getCompanyName()).isEqualTo("Acme Inventory");
        assertThat(settingsService.get().getLowStockThreshold()).isEqualTo(12);
    }
}
