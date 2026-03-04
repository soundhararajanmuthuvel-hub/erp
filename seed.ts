import mongoose from 'mongoose';
import User, { UserRole } from './server/models/User';
import dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/erp_db';
    await mongoose.connect(uri);
    
    const adminExists = await User.findOne({ email: 'admin@aoerp.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@aoerp.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: UserRole.ADMIN
      });
      console.log('Admin user seeded successfully');
    } else {
      console.log('Admin user already exists');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
