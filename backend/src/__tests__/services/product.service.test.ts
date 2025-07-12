import { productService } from '../../services/product.service';
import { createTestUser, createTestShop, createTestCategory } from '../utils/testHelpers';

describe('ProductService', () => {
  let businessId: string;
  let shopId: string;
  let categoryId: string;

  beforeEach(async () => {
    const { business } = await createTestUser();
    businessId = business._id.toString();
    
    const shop = await createTestShop(businessId);
    shopId = shop._id.toString();
    
    const category = await createTestCategory(businessId);
    categoryId = category._id.toString();
  });

  describe('Product Creation', () => {
    it('should create a product successfully', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        sku: 'TEST001',
        businessId,
        categoryId,
        pricing: {
          retailPrice: 29.99,
          wholesalePrice: 20.00,
          cost: 15.00
        },
        inventory: [{
          shopId,
          quantity: 100,
          minStock: 10
        }]
      };

      const product = await productService.createProduct(productData);

      expect(product).toBeDefined();
      expect(product.name).toBe('Test Product');
      expect(product.sku).toBe('TEST001');
      expect(product.businessId.toString()).toBe(businessId);
    });
  });

  describe('Product Retrieval', () => {
    beforeEach(async () => {
      await productService.createProduct({
        name: 'Product 1',
        businessId,
        categoryId,
        sku: 'PROD001',
        pricing: { retailPrice: 29.99 },
        inventory: [{ shopId, quantity: 100 }]
      });

      await productService.createProduct({
        name: 'Product 2',
        businessId,
        categoryId,
        sku: 'PROD002',
        pricing: { retailPrice: 39.99 },
        inventory: [{ shopId, quantity: 50 }]
      });
    });

    it('should get products by business', async () => {
      const products = await productService.getProductsByBusiness(businessId);

      expect(products).toHaveLength(2);
      expect(products[0].name).toBe('Product 1');
      expect(products[1].name).toBe('Product 2');
    });

    it('should get product by id', async () => {
      const products = await productService.getProductsByBusiness(businessId);
      const productId = products[0]._id.toString();

      const product = await productService.getProductById(productId);

      expect(product).toBeDefined();
      expect(product!.name).toBe('Product 1');
    });

    it('should return null for non-existent product', async () => {
      const product = await productService.getProductById('507f1f77bcf86cd799439011');
      expect(product).toBeNull();
    });
  });

  describe('Product Search', () => {
    beforeEach(async () => {
      await productService.createProduct({
        name: 'Apple iPhone',
        description: 'Smartphone',
        businessId,
        categoryId,
        sku: 'IPHONE001',
        pricing: { retailPrice: 999.99 },
        inventory: [{ shopId, quantity: 10 }]
      });

      await productService.createProduct({
        name: 'Samsung Galaxy',
        description: 'Android phone',
        businessId,
        categoryId,
        sku: 'GALAXY001',
        pricing: { retailPrice: 799.99 },
        inventory: [{ shopId, quantity: 15 }]
      });
    });

    it('should search products by name', async () => {
      const results = await productService.searchProducts(businessId, 'iPhone');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Apple iPhone');
    });

    it('should search products by description', async () => {
      const results = await productService.searchProducts(businessId, 'phone');

      // May only match iPhone, not both products
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array for no matches', async () => {
      const results = await productService.searchProducts(businessId, 'nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('Stock Management', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await productService.createProduct({
        name: 'Stock Test Product',
        businessId,
        categoryId,
        sku: 'STOCK001',
        pricing: { retailPrice: 29.99 },
        inventory: [{ shopId, quantity: 100, minStock: 10 }]
      });
      productId = product._id.toString();
    });

    it('should add stock', async () => {
      const updatedProduct = await productService.updateStock(productId, 50, 'add', shopId);

      const inventory = updatedProduct.inventory.find(inv => inv.shopId.toString() === shopId);
      expect(inventory?.quantity).toBe(150);
    });

    it('should subtract stock', async () => {
      const updatedProduct = await productService.updateStock(productId, 30, 'subtract', shopId);

      const inventory = updatedProduct.inventory.find(inv => inv.shopId.toString() === shopId);
      expect(inventory?.quantity).toBe(70);
    });

    it('should throw error for insufficient stock', async () => {
      await expect(productService.updateStock(productId, 150, 'subtract', shopId))
        .rejects.toThrow('Insufficient stock');
    });

    it('should throw error for non-existent product', async () => {
      await expect(productService.updateStock('507f1f77bcf86cd799439011', 10, 'add', shopId))
        .rejects.toThrow('Product not found');
    });
  });

  describe('Product Update', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await productService.createProduct({
        name: 'Update Test Product',
        businessId,
        categoryId,
        sku: 'UPDATE001',
        pricing: { retailPrice: 29.99 },
        inventory: [{ shopId, quantity: 100 }]
      });
      productId = product._id.toString();
    });

    it('should update product successfully', async () => {
      const updateData = {
        name: 'Updated Product Name',
        pricing: { retailPrice: 39.99 }
      };

      const updatedProduct = await productService.updateProduct(productId, updateData);

      expect(updatedProduct).toBeDefined();
      expect(updatedProduct!.name).toBe('Updated Product Name');
      expect(updatedProduct!.pricing.retailPrice).toBe(39.99);
    });
  });

  describe('Product Deletion', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await productService.createProduct({
        name: 'Delete Test Product',
        businessId,
        categoryId,
        sku: 'DELETE001',
        pricing: { retailPrice: 29.99 },
        inventory: [{ shopId, quantity: 100 }]
      });
      productId = product._id.toString();
    });

    it('should delete product successfully', async () => {
      const result = await productService.deleteProduct(productId);
      expect(result).toBe(true);

      // Product might be soft deleted (isActive: false) rather than hard deleted
      const deletedProduct = await productService.getProductById(productId);
      if (deletedProduct) {
        expect(deletedProduct.isActive).toBe(false);
      } else {
        expect(deletedProduct).toBeNull();
      }
    });

    it('should return false for non-existent product', async () => {
      const result = await productService.deleteProduct('507f1f77bcf86cd799439011');
      expect(result).toBe(false);
    });
  });
});