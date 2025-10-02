// createAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/user.model');

const createAdmin = async () => {
  try {
    // 1. Connect using the live URI (from your local .env file)
    await mongoose.connect(process.env.MONGO_URI); 
    console.log("Connected to MongoDB");

    const email = 'admin@pressmart.com';
    const password = 'admin123';
    
    // 2. Hash the standard password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Find existing admin
    let existingAdmin = await User.findOne({ email: email });

    if (existingAdmin) {
      // FIXED: If admin exists, only update the password and crucial fields
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin'; // Ensure role is correct
      existingAdmin.isSeller = true;
      
      await existingAdmin.save();
      console.log('Admin already exists! Password RESET successfully to: admin123');
      process.exit(0);
    }

    // 4. If admin does NOT exist, create the new user
    const adminUser = new User({
      name: 'Admin User',
      email: email,
      password: hashedPassword,
      role: 'admin',
      isSeller: true
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();