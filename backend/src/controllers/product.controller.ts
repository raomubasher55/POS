import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { productService } from '../services/product.service';
import { AuthenticatedRequest } from '../types';

export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const productData = {
      ...req.body,
      businessId: req.user.businessId
    };

    const product = await productService.createProduct(productData);
    res.status(201).json({ 
      message: 'Product created successfully',
      product 
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = req.user.businessId?.toString();
    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    const products = await productService.getProductsByBusiness(businessId);
    res.json({ products });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const product = await productService.getProductById(productId);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ product });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { productId } = req.params;
    const updateData = req.body;

    const product = await productService.updateProduct(productId, updateData);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ 
      message: 'Product updated successfully',
      product 
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const success = await productService.deleteProduct(productId);

    if (!success) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { quantity, operation, shopId } = req.body;

    if (!quantity || !operation || !['add', 'subtract'].includes(operation) || !shopId) {
      res.status(400).json({ message: 'Invalid quantity, operation, or shopId' });
      return;
    }

    const product = await productService.updateStock(productId, quantity, operation, shopId);
    res.json({ 
      message: 'Stock updated successfully',
      product 
    });

  } catch (error: any) {
    if (error.message === 'Product not found' || error.message === 'Insufficient stock') {
      res.status(400).json({ message: error.message });
      return;
    }
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const searchProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = req.user.businessId?.toString();
    const { q: searchTerm } = req.query;

    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    if (!searchTerm || typeof searchTerm !== 'string') {
      res.status(400).json({ message: 'Search term required' });
      return;
    }

    const products = await productService.searchProducts(businessId, searchTerm);
    res.json({ products });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};