import Product from '../models/product.model';

export class ProductService {
  async createProduct(productData: any): Promise<any> {
    const product = new Product(productData);
    return await product.save();
  }

  async getProductById(productId: string): Promise<any> {
    return await Product.findById(productId)
      .populate('categoryId', 'name')
      .populate('businessId', 'name');
  }

  async getProductsByBusiness(businessId: string): Promise<any[]> {
    return await Product.find({ businessId, isActive: true })
      .populate('categoryId', 'name')
      .sort({ name: 1 });
  }

  async updateProduct(productId: string, updateData: any): Promise<any> {
    return await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');
  }

  async deleteProduct(productId: string): Promise<boolean> {
    const result = await Product.findByIdAndUpdate(
      productId,
      { isActive: false },
      { new: true }
    );
    return !!result;
  }

  async updateStock(productId: string, quantity: number, operation: 'add' | 'subtract', shopId: string): Promise<any> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const shopInventory = product.inventory.find((inv: any) => inv.shopId.toString() === shopId);
    if (!shopInventory) {
      throw new Error('Shop inventory not found');
    }

    if (operation === 'add') {
      shopInventory.quantity += quantity;
    } else {
      if (shopInventory.quantity < quantity) {
        throw new Error('Insufficient stock');
      }
      shopInventory.quantity -= quantity;
    }

    return await product.save();
  }

  async getLowStockProducts(businessId: string): Promise<any[]> {
    const products = await Product.find({ businessId, isActive: true })
      .populate('categoryId', 'name');
    
    return products.filter((product: any) => {
      return product.inventory.some((inv: any) => inv.quantity <= inv.minStock);
    });
  }

  async searchProducts(businessId: string, searchTerm: string): Promise<any[]> {
    return await Product.find({
      businessId,
      isActive: true,
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { sku: { $regex: searchTerm, $options: 'i' } },
        { barcode: { $regex: searchTerm, $options: 'i' } }
      ]
    }).populate('categoryId', 'name');
  }
}

export const productService = new ProductService();