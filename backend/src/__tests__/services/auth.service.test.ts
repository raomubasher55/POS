import { authService } from '../../services/auth.service';
import User from '../../models/user.model';
import Business from '../../models/business.model';
import Shop from '../../models/shop.model';

describe('AuthService', () => {
  describe('Token Generation', () => {
    it('should generate access and refresh tokens', () => {
      const userId = '507f1f77bcf86cd799439011';
      const tokens = authService.generateTokens(userId);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });
  });

  describe('User Registration', () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      businessName: 'Test Business',
      businessEmail: 'business@test.com',
      businessPhone: '123-456-7890',
      businessAddress: '123 Test St, Test City, Test State, 12345, Test Country'
    };

    it('should register a new user with business and shop', async () => {
      const result = await authService.registerUser(userData);

      expect(result.user).toBeDefined();
      expect(result.business).toBeDefined();
      expect(result.shop).toBeDefined();
      expect(result.tokens).toBeDefined();

      expect(result.user.email).toBe(userData.email);
      expect(result.user.role).toBe('business_owner');
      expect(result.business.name).toBe(userData.businessName);
      expect(result.shop.name).toBe(userData.businessName);
    });

    it('should throw error for duplicate email', async () => {
      await authService.registerUser(userData);

      await expect(authService.registerUser({
        ...userData,
        businessEmail: 'different@test.com'
      })).rejects.toThrow('User already exists');
    });

    it('should link user, business, and shop correctly', async () => {
      const result = await authService.registerUser(userData);

      expect(result.user.businessId.toString()).toBe(result.business._id.toString());
      expect(result.business.owner.toString()).toBe(result.user._id.toString());
      expect(result.shop.businessId.toString()).toBe(result.business._id.toString());
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      await authService.registerUser({
        email: 'login@test.com',
        password: 'password123',
        firstName: 'Login',
        lastName: 'User',
        businessName: 'Login Business',
        businessEmail: 'loginbiz@test.com',
        businessPhone: '123-456-7890',
        businessAddress: '123 Login St, Login City, Login State, 12346, Login Country'
      });
    });

    it('should login with valid credentials', async () => {
      const result = await authService.loginUser('login@test.com', 'password123');

      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.user.email).toBe('login@test.com');
    });

    it('should throw error for invalid email', async () => {
      await expect(authService.loginUser('wrong@test.com', 'password123'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      await expect(authService.loginUser('login@test.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should update last login time', async () => {
      const beforeLogin = new Date();
      const result = await authService.loginUser('login@test.com', 'password123');
      
      expect(result.user.lastLogin).toBeDefined();
      expect(result.user.lastLogin!.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
    });
  });

  describe('Token Refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const registerResult = await authService.registerUser({
        email: 'refresh@test.com',
        password: 'password123',
        firstName: 'Refresh',
        lastName: 'User',
        businessName: 'Refresh Business',
        businessEmail: 'refreshbiz@test.com',
        businessPhone: '123-456-7890',
        businessAddress: '123 Refresh St, Refresh City, Refresh State, 12347, Refresh Country'
      });

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newTokens = await authService.refreshUserToken(registerResult.tokens.refreshToken);

      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
      expect(newTokens.accessToken).not.toBe(registerResult.tokens.accessToken);
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(authService.refreshUserToken('invalid-token'))
        .rejects.toThrow('Invalid refresh token');
    });
  });

  describe('User Logout', () => {
    it('should clear refresh token on logout', async () => {
      const registerResult = await authService.registerUser({
        email: 'logout@test.com',
        password: 'password123',
        firstName: 'Logout',
        lastName: 'User',
        businessName: 'Logout Business',
        businessEmail: 'logoutbiz@test.com',
        businessPhone: '123-456-7890',
        businessAddress: '123 Logout St, Logout City, Logout State, 12348, Logout Country'
      });

      await authService.logoutUser(registerResult.user._id.toString());

      const user = await User.findById(registerResult.user._id);
      expect(user?.refreshToken).toBeUndefined();
    });
  });
});