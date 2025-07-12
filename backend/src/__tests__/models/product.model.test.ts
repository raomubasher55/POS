import Product from '../../models/product.model';
import { createTestUser, createTestShop, createTestCategory } from '../utils/testHelpers';

describe('Product Model', () => {
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
    it('should create a product with valid data', async () => {
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
          minStock: 10,
          maxStock: 500
        }]
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.name).toBe('Test Product');
      expect(savedProduct.sku).toBe('TEST001');
      expect(savedProduct.pricing.retailPrice).toBe(29.99);
      expect(savedProduct.inventory[0].shopId.toString()).toBe(shopId);
      expect(savedProduct.inventory[0].quantity).toBe(100);
    });

    it('should require SKU field', async () => {
      const product = new Product({
        name: 'Test Product',
        businessId,
        categoryId,
        pricing: { retailPrice: 29.99 },
        inventory: [{ shopId, quantity: 100 }]
      });

      await expect(product.save()).rejects.toThrow();
    });
  });

  describe('Product Validation', () => {
    it('should require name', async () => {
      const product = new Product({
        businessId,
        categoryId,
        sku: 'TEST001',
        pricing: { retailPrice: 29.99 },
        inventory: [{ shopId, quantity: 100 }]
      });

      await expect(product.save()).rejects.toThrow();
    });

    it('should require businessId', async () => {
      const product = new Product({
        name: 'Test Product',
        categoryId,
        sku: 'TEST001',
        pricing: { retailPrice: 29.99 },
        inventory: [{ shopId, quantity: 100 }]
      });

      await expect(product.save()).rejects.toThrow();
    });

    it('should require categoryId', async () => {
      const product = new Product({
        name: 'Test Product',
        businessId,
        sku: 'TEST001',
        pricing: { retailPrice: 29.99 },
        inventory: [{ shopId, quantity: 100 }]
      });

      await expect(product.save()).rejects.toThrow();
    });

    it('should require shopId in inventory', async () => {
      const product = new Product({
        name: 'Test Product',
        businessId,
        categoryId,
        sku: 'TEST001',
        pricing: { retailPrice: 29.99 },
        inventory: [{ quantity: 100 } as any]
      });

      await expect(product.save()).rejects.toThrow();
    });
  });

  describe('Product Methods', () => {
    it('should calculate total stock across all shops', async () => {
      const shop2 = await createTestShop(businessId, { name: 'Shop 2' });
      
      const product = new Product({
        name: 'Test Product',
        businessId,
        categoryId,
        sku: 'TEST001',
        pricing: { retailPrice: 29.99 },
        inventory: [
          { shopId, quantity: 100 },
          { shopId: shop2._id, quantity: 50 }
        ]
      });

      const savedProduct = await product.save();
      const totalStock = savedProduct.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
      
      expect(totalStock).toBe(150);
    });
  });
});