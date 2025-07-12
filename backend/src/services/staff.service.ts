import User from '../models/user.model';
import bcrypt from 'bcryptjs';

interface StaffCreateData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'manager' | 'cashier' | 'inventory_manager';
  permissions: string[];
  businessId: string;
}

interface StaffUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  isActive?: boolean;
}

export class StaffService {
  // Default permissions for different roles
  private defaultPermissions = {
    manager: [
      'manage_products',
      'manage_inventory',
      'manage_sales',
      'manage_customers',
      'manage_staff',
      'view_reports',
      'manage_settings'
    ],
    cashier: [
      'manage_sales',
      'view_products',
      'view_customers',
      'manage_customers'
    ],
    inventory_manager: [
      'manage_products',
      'manage_inventory',
      'view_reports'
    ]
  };

  async createStaff(staffData: StaffCreateData): Promise<any> {
    // Set default permissions based on role
    const permissions = staffData.permissions.length > 0 
      ? staffData.permissions 
      : this.defaultPermissions[staffData.role] || [];

    const user = new User({
      ...staffData,
      role: 'staff',
      permissions,
      // Store the specific staff role in permissions as well
      staffRole: staffData.role
    });

    return await user.save();
  }

  async getStaffByBusiness(businessId: string, options: any = {}): Promise<any> {
    const { page = 1, limit = 20, role, isActive = true } = options;
    const skip = (page - 1) * limit;

    const query: any = { 
      businessId, 
      role: 'staff',
      isActive 
    };

    // Filter by staff role if provided
    if (role) {
      query.permissions = { $in: [role] };
    }

    const [staff, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    return {
      staff,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getStaffById(staffId: string): Promise<any> {
    return await User.findById(staffId)
      .select('-password -refreshToken')
      .populate('businessId', 'name');
  }

  async updateStaff(staffId: string, updateData: StaffUpdateData): Promise<any> {
    // If role is being updated, update permissions accordingly
    if (updateData.role && !updateData.permissions) {
      updateData.permissions = this.defaultPermissions[updateData.role as keyof typeof this.defaultPermissions] || [];
    }

    return await User.findByIdAndUpdate(
      staffId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');
  }

  async deleteStaff(staffId: string): Promise<boolean> {
    const result = await User.findByIdAndUpdate(
      staffId,
      { isActive: false },
      { new: true }
    );
    return !!result;
  }

  async updateStaffPermissions(staffId: string, permissions: string[]): Promise<any> {
    return await User.findByIdAndUpdate(
      staffId,
      { permissions },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');
  }

  async resetStaffPassword(staffId: string, newPassword: string): Promise<any> {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    return await User.findByIdAndUpdate(
      staffId,
      { password: hashedPassword },
      { new: true }
    ).select('-password -refreshToken');
  }

  async getStaffPermissions(staffId: string): Promise<string[]> {
    const staff = await User.findById(staffId).select('permissions');
    return staff?.permissions || [];
  }

  async hasPermission(staffId: string, permission: string): Promise<boolean> {
    const staff = await User.findById(staffId).select('permissions');
    return staff?.permissions?.includes(permission) || false;
  }

  async getStaffAnalytics(businessId: string): Promise<any> {
    const [
      totalStaff,
      activeStaff,
      staffByRole,
      recentLogins
    ] = await Promise.all([
      User.countDocuments({ businessId, role: 'staff' }),
      
      User.countDocuments({ businessId, role: 'staff', isActive: true }),
      
      User.aggregate([
        { $match: { businessId, role: 'staff', isActive: true } },
        { $unwind: '$permissions' },
        { 
          $group: { 
            _id: '$permissions', 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { count: -1 } }
      ]),
      
      User.find({ 
        businessId, 
        role: 'staff', 
        isActive: true,
        lastLogin: { $exists: true }
      })
      .select('firstName lastName lastLogin')
      .sort({ lastLogin: -1 })
      .limit(5)
    ]);

    return {
      totalStaff,
      activeStaff,
      inactiveStaff: totalStaff - activeStaff,
      staffByRole,
      recentLogins
    };
  }

  async getAvailablePermissions(): Promise<string[]> {
    return [
      'manage_products',
      'view_products',
      'manage_inventory',
      'manage_sales',
      'view_sales',
      'manage_customers',
      'view_customers',
      'manage_staff',
      'view_staff',
      'view_reports',
      'manage_reports',
      'manage_settings',
      'view_settings',
      'manage_discounts',
      'process_refunds',
      'void_sales'
    ];
  }

  async searchStaff(businessId: string, searchTerm: string): Promise<any[]> {
    const searchRegex = new RegExp(searchTerm, 'i');
    
    return await User.find({
      businessId,
      role: 'staff',
      isActive: true,
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ]
    })
    .select('-password -refreshToken')
    .sort({ firstName: 1, lastName: 1 })
    .limit(10);
  }

  async updateLastLogin(staffId: string): Promise<void> {
    await User.findByIdAndUpdate(staffId, { lastLogin: new Date() });
  }
}

export const staffService = new StaffService();