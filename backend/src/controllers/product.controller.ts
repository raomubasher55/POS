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

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    
    // Get default shop if shopId not provided
    const shopId = req.body.shopId;
    if (!shopId) {
      res.status(400).json({ message: 'Shop ID is required' });
      return;
    }
    
    // Transform flat input to model structure
    const productData = {
      name: req.body.name,
      description: req.body.description,
      sku: req.body.sku || `${Date.now()}`,
      businessId,
      categoryId: req.body.categoryId,
      pricing: {
        retailPrice: req.body.price,
        wholesalePrice: req.body.wholesalePrice,
        cost: req.body.cost
      },
      inventory: [{
        shopId: shopId,
        quantity: req.body.stock || 0,
        minStock: req.body.minStock || 0,
        maxStock: req.body.maxStock
      }],
      isActive: true
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

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
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

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
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

export const bulkImportProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'CSV file is required' });
      return;
    }

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    const csvData = req.file.buffer.toString();
    const lines = csvData.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      res.status(400).json({ message: 'CSV file must contain headers and at least one data row' });
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['name', 'price', 'stock'];
    
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        res.status(400).json({ message: `Missing required column: ${required}` });
        return;
      }
    }

    const importResults = {
      success: 0,
      errors: [] as string[],
      created: [] as any[]
    };

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        // Validate required fields
        if (!rowData.name || !rowData.price) {
          importResults.errors.push(`Row ${i + 1}: Missing name or price`);
          continue;
        }

        // Create product data
        const productData = {
          name: rowData.name,
          description: rowData.description || '',
          sku: rowData.sku || `IMP-${Date.now()}-${i}`,
          businessId,
          categoryId: rowData.categoryid || null,
          pricing: {
            retailPrice: parseFloat(rowData.price) || 0,
            wholesalePrice: parseFloat(rowData.wholesaleprice) || 0,
            cost: parseFloat(rowData.cost) || 0
          },
          inventory: [{
            shopId: req.body.shopId, // Default shop from request
            quantity: parseInt(rowData.stock) || 0,
            minStock: parseInt(rowData.minstock) || 0,
            maxStock: parseInt(rowData.maxstock) || 0
          }],
          isActive: true
        };

        const product = await productService.createProduct(productData);
        importResults.created.push(product);
        importResults.success++;

      } catch (error) {
        importResults.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    res.json({
      message: 'Bulk import completed',
      results: importResults
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ message: 'Server error during bulk import' });
  }
};

export const exportProductsCSV = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    const products = await productService.getProductsByBusiness(businessId);

    // Create CSV headers
    const headers = [
      'Name',
      'SKU',
      'Description',
      'Category',
      'Retail Price',
      'Wholesale Price',
      'Cost',
      'Stock',
      'Min Stock',
      'Max Stock',
      'Status'
    ];

    // Create CSV rows
    const rows = products.map(product => [
      product.name,
      product.sku,
      product.description || '',
      (product.categoryId as any)?.name || '',
      product.pricing?.retailPrice || 0,
      product.pricing?.wholesalePrice || 0,
      product.pricing?.cost || 0,
      product.totalStock || 0,
      product.inventory?.[0]?.minStock || 0,
      product.inventory?.[0]?.maxStock || 0,
      product.isActive ? 'Active' : 'Inactive'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.csv"`);
    
    res.send(csvContent);

  } catch (error) {
    console.error('Export products error:', error);
    res.status(500).json({ message: 'Server error during export' });
  }
};