import Category from '../models/category.model';

export class CategoryService {
  async createCategory(categoryData: any): Promise<any> {
    const category = new Category(categoryData);
    return await category.save();
  }

  async getCategoryById(categoryId: string): Promise<any> {
    return await Category.findById(categoryId)
      .populate('businessId', 'name')
      .populate('parentCategory', 'name');
  }

  async getCategoriesByBusiness(businessId: string): Promise<any[]> {
    return await Category.find({ businessId, isActive: true })
      .populate('parentCategory', 'name')
      .sort({ name: 1 });
  }

  async updateCategory(categoryId: string, updateData: any): Promise<any> {
    return await Category.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true, runValidators: true }
    );
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    const result = await Category.findByIdAndUpdate(
      categoryId,
      { isActive: false },
      { new: true }
    );
    return !!result;
  }

  async getCategoryTree(businessId: string): Promise<any[]> {
    return await (Category as any).getCategoryTree(businessId);
  }
}

export const categoryService = new CategoryService();