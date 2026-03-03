import mongoose from 'mongoose';
import User, { UserRole } from './server/models/User';

const seed = async () => {
  const uri = "mongodb+srv://soundhararajanmuthuvel_db_user:Annai123@cluster0.t0ihxtg.mongodb.net/natural_erp?retryWrites=true&w=majority";
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding...');
    
    const adminExists = await User.findOne({ email: 'admin@naturalflow.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@naturalflow.com',
        password: 'admin123',
        role: UserRole.ADMIN
      });
      console.log('Admin user seeded successfully');
    } else {
      console.log('Admin user already exists');
    }
    
    process.exit(0);
  } catch (err: any) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
