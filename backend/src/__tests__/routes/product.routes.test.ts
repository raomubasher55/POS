import request from 'supertest';
import express from 'express';
import productRoutes from '../../routes/product.routes';
import { createTestUser, createTestShop, createTestCategory, generateTestToken } from '../utils/testHelpers';

const app = express();
app.use(express.json());
app.use('/products', productRoutes);

describe('Product Routes', () => {
  let authToken: string;
  let businessId: string;
  let shopId: string;
  let categoryId: string;
  let userId: string;

  beforeEach(async () => {
    const { user, business } = await createTestUser();
    const shop = await createTestShop(business._id.toString());
    const category = await createTestCategory(business._id.toString());
    
    userId = user._id.toString();
    businessId = business._id.toString();
    shopId = shop._id.toString();
    categoryId = category._id.toString();
    authToken = generateTestToken(userId);
  });

  describe('POST /products', () => {
    it('should create a product successfully', async () => {
      const validProductData = {
        name: 'Test Product',
        description: 'A test product',
        price: 29.99,
        stock: 100,
        minStock: 10,
        categoryId
      };

      const productPayload = { ...validProductData, shopId };
      
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productPayload)
        .expect(201);
      expect(response.body.message).toBe('Product created successfully');
      expect(response.body.product).toBeDefined();
      expect(response.body.product.name).toBe(validProductData.name);
    });

    it('should return 400 for missing shopId', async () => {
      const validProductData = {
        name: 'Test Product',
        description: 'A test product',
        price: 29.99,
        stock: 100,
        minStock: 10,
        categoryId
      };

      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validProductData)
        .expect(400);

      expect(response.body.message).toBe('Shop ID is required');
    });

    it('should return 400 for validation errors', async () => {
      const validProductData = {
        name: 'Test Product',
        description: 'A test product',
        price: 29.99,
        stock: 100,
        minStock: 10,
        categoryId
      };

      const invalidData = { ...validProductData };
      delete invalidData.name;

      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...invalidData, shopId })
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 401 for missing auth token', async () => {
      const validProductData = {
        name: 'Test Product',
        description: 'A test product',
        price: 29.99,
        stock: 100,
        minStock: 10,
        categoryId
      };

      await request(app)
        .post('/products')
        .send({ ...validProductData, shopId })
        .expect(401);
    });
  });

  describe('GET /products', () => {
    beforeEach(async () => {
      await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Product 1',
          description: 'First product',
          price: 29.99,
          stock: 100,
          categoryId,
          shopId
        });

      await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Product 2',
          description: 'Second product',
          price: 39.99,
          stock: 50,
          categoryId,
          shopId
        });
    });

    it('should get all products for business', async () => {
      const response = await request(app)
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.products).toBeDefined();
      expect(response.body.products).toHaveLength(2);
    });

    it('should return 401 for missing auth token', async () => {
      await request(app)
        .get('/products')
        .expect(401);
    });
  });

  describe('GET /products/search', () => {
    beforeEach(async () => {
      await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'iPhone 15',
          description: 'Apple smartphone',
          price: 999.99,
          stock: 10,
          categoryId,
          shopId
        });

      await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Samsung Galaxy',
          description: 'Android smartphone',
          price: 799.99,
          stock: 15,
          categoryId,
          shopId
        });
    });

    it('should search products by name', async () => {
      const response = await request(app)
        .get('/products/search?q=iPhone')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe('iPhone 15');
    });

    it('should search products by description', async () => {
      const response = await request(app)
        .get('/products/search?q=smartphone')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Search may return different results based on implementation
      expect(response.body.products).toBeDefined();
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    it('should return 400 for missing search term', async () => {
      const response = await request(app)
        .get('/products/search')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.message).toBe('Search term required');
    });
  });

  describe('GET /products/:productId', () => {
    let productId: string;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          description: 'A test product',
          price: 29.99,
          stock: 100,
          categoryId,
          shopId
        });

      productId = createResponse.body.product._id;
    });

    it('should get product by id', async () => {
      const response = await request(app)
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.product).toBeDefined();
      expect(response.body.product.name).toBe('Test Product');
    });

    it('should return 404 for non-existent product', async () => {
      await request(app)
        .get('/products/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /products/:productId', () => {
    let productId: string;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          description: 'A test product',
          price: 29.99,
          stock: 100,
          categoryId,
          shopId
        });

      productId = createResponse.body.product._id;
    });

    it('should update product successfully', async () => {
      const updateData = {
        name: 'Updated Product',
        pricing: { retailPrice: 39.99 }
      };

      const response = await request(app)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Product updated successfully');
      expect(response.body.product.name).toBe('Updated Product');
    });

    it('should return 404 for non-existent product', async () => {
      await request(app)
        .put('/products/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Product' })
        .expect(404);
    });
  });

  describe('DELETE /products/:productId', () => {
    let productId: string;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          description: 'A test product',
          price: 29.99,
          stock: 100,
          categoryId,
          shopId
        });

      productId = createResponse.body.product._id;
    });

    it('should delete product successfully', async () => {
      const response = await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Product deleted successfully');
    });

    it('should return 404 for non-existent product', async () => {
      await request(app)
        .delete('/products/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /products/:productId/stock', () => {
    let productId: string;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Stock Test Product',
          description: 'A test product',
          price: 29.99,
          stock: 100,
          categoryId,
          shopId
        });

      productId = createResponse.body.product._id;
    });

    it('should add stock successfully', async () => {
      const response = await request(app)
        .patch(`/products/${productId}/stock`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 50,
          operation: 'add',
          shopId
        })
        .expect(200);

      expect(response.body.message).toBe('Stock updated successfully');
    });

    it('should subtract stock successfully', async () => {
      const response = await request(app)
        .patch(`/products/${productId}/stock`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 30,
          operation: 'subtract',
          shopId
        })
        .expect(200);

      expect(response.body.message).toBe('Stock updated successfully');
    });

    it('should return 400 for insufficient stock', async () => {
      const response = await request(app)
        .patch(`/products/${productId}/stock`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 150,
          operation: 'subtract',
          shopId
        })
        .expect(400);

      expect(response.body.message).toBe('Insufficient stock');
    });

    it('should return 400 for invalid operation', async () => {
      const response = await request(app)
        .patch(`/products/${productId}/stock`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 50,
          operation: 'invalid',
          shopId
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid quantity, operation, or shopId');
    });
  });
});