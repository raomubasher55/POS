import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User';
import Business from './models/Business';

async function testRegistration() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos_system');
    console.log('Connected to MongoDB');

    // Test data
    const testData = {
      email: 'admin@testpos.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      businessName: 'Test POS Business',
      businessEmail: 'business@testpos.com',
      businessPhone: '+1234567890',
      businessAddress: {
        street: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'USA'
      }
    };

    // Create business
    console.log('Creating business...');
    const business = new Business({
      name: testData.businessName,
      email: testData.businessEmail,
      phone: testData.businessPhone,
      address: testData.businessAddress
    });

    const savedBusiness = await business.save();
    console.log('Business created:', savedBusiness._id);

    // Create user
    console.log('Creating user...');
    const user = new User({
      email: testData.email,
      password: testData.password,
      firstName: testData.firstName,
      lastName: testData.lastName,
      role: 'business_owner',
      businessId: savedBusiness._id,
      permissions: ['all']
    });

    const savedUser = await user.save();
    console.log('User created:', savedUser._id);

    // Update business with owner
    console.log('Updating business owner...');
    savedBusiness.owner = savedUser._id as any;
    await savedBusiness.save();
    console.log('Business updated with owner');

    console.log('✅ Registration successful!');
    console.log('Credentials:');
    console.log('Email:', testData.email);
    console.log('Password:', testData.password);

  } catch (error) {
    console.error('❌ Registration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testRegistration();