import User from '../../models/user.model';
import { createTestUser } from '../utils/testHelpers';

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const { user } = await createTestUser();

      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('Test');
      expect(user.lastName).toBe('User');
      expect(user.role).toBe('business_owner');
      expect(user.isActive).toBe(true);
    });

    it('should hash password before saving', async () => {
      const { user } = await createTestUser();
      
      expect(user.password).not.toBe('password123');
      expect(user.password.length).toBeGreaterThan(10);
    });

    it('should validate password correctly', async () => {
      const { user } = await createTestUser();
      
      const isValid = await user.comparePassword('password123');
      const isInvalid = await user.comparePassword('wrongpassword');
      
      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe('User Validation', () => {
    it('should require email', async () => {
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        role: 'cashier'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require unique email', async () => {
      await createTestUser();
      
      const duplicateUser = new User({
        email: 'test@example.com',
        firstName: 'Test2',
        lastName: 'User2',
        password: 'password123',
        role: 'cashier'
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const user = new User({
        email: 'invalid-email',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        role: 'cashier'
      });

      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('User Roles', () => {
    it('should accept valid roles', async () => {
      const validRoles = ['admin', 'business_owner', 'staff'];
      
      for (const role of validRoles) {
        const { user } = await createTestUser({
          user: { 
            email: `test-${role}@example.com`,
            role 
          }
        });
        expect(user.role).toBe(role);
      }
    });

    it('should reject invalid roles', async () => {
      const user = new User({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        role: 'invalid_role' as any
      });

      await expect(user.save()).rejects.toThrow();
    });
  });
});