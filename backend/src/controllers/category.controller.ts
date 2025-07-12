import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { categoryService } from '../services/category.service';
import { AuthenticatedRequest } from '../types';

export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    const categoryData = {
      ...req.body,
      businessId
    };

    const category = await categoryService.createCategory(categoryData);
    res.status(201).json({ 
      message: 'Category created successfully',
      category 
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    const categories = await categoryService.getCategoriesByBusiness(businessId);
    res.json({ categories });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { categoryId } = req.params;
    const category = await categoryService.getCategoryById(categoryId);
    
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.json({ category });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { categoryId } = req.params;
    const category = await categoryService.updateCategory(categoryId, req.body);
    
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.json({ 
      message: 'Category updated successfully',
      category 
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { categoryId } = req.params;
    const success = await categoryService.deleteCategory(categoryId);
    
    if (!success) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.json({ message: 'Category deleted successfully' });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};