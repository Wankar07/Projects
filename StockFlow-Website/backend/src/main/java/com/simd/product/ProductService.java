package com.simd.product;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findByActiveTrue();
    }

    @Transactional
    public Product createProduct(Product product) {
        product.setId(null);

        if (product.getActive() == null) {
            product.setActive(true);
        }

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, Product updatedProduct) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(updatedProduct.getName());
        product.setSku(updatedProduct.getSku());
        product.setCategory(updatedProduct.getCategory());
        product.setSellingPrice(updatedProduct.getSellingPrice());
        product.setCostPrice(updatedProduct.getCostPrice());
        product.setStockQuantity(updatedProduct.getStockQuantity());
        product.setLowStockThreshold(updatedProduct.getLowStockThreshold());
        product.setActive(updatedProduct.getActive());

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {

        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }

        productRepository.deleteById(id);
    }
}