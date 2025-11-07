import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Profile from '../models/Profile.js';

dotenv.config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Admin user details
    const email = 'admin@easyhealth.com';
    const password = 'admin123';
    const full_name = 'System Administrator';

    // Check if admin already exists
    const existingAdmin = await Profile.findOne({ email });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', email);
      console.log('   You can login with:');
      console.log('   Email:', email);
      console.log('   Password:', password);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const admin = new Profile({
      email,
      password: hashedPassword,
      full_name,
      role: 'admin',
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('');
    console.log('🚀 You can now login to the admin dashboard');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();


