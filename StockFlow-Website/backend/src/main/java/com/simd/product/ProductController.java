package com.simd.product;

import lombok.RequiredArgsConstructor;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<Product> getProducts() {
        return productService.getAllProducts();
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestBody Product product
    ) {
        return productService.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);

        return Map.of(
                "message", "Product deleted successfully"
        );
    }
}
