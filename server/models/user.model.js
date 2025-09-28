const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['customer', 'seller', 'manufacturer', 'admin'],
    default: 'customer'
  },
  isSeller: { 
    type: Boolean, 
    default: false 
  },
  companyName: { 
    type: String,
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  companyDescription: { 
    type: String,
    trim: true,
    maxlength: [1000, 'Company description cannot exceed 1000 characters']
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    // Fixed: Only set default for manufacturers, others don't need verification
    // default: function() {
    //   return this.role === 'manufacturer' ? 'pending' : 'approved';
    // }
    default: 'approved'
  },
  // Additional useful fields
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]{10,15}$/, 'Please enter a valid phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  profileImage: {
    type: String,
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i, 'Please enter a valid image URL']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLoginAt: {
    type: Date
  },
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
});

// Indexes for better query performance
userSchema.index({ role: 1 });
userSchema.index({ verificationStatus: 1 });
userSchema.index({ createdAt: -1 });

// Middleware to handle role changes
userSchema.pre('save', function(next) {

  // Only when role is being set to manufacturer, require verification
  if (this.isNew && this.role === 'customer') {
    // New customers don't need verification
    this.verificationStatus = 'approved';
    this.isSeller = false;
  }
  
  // When role changes to manufacturer, set verification status to pending
  if (this.isModified('role') && this.role === 'manufacturer') {
    this.verificationStatus = 'pending';
    this.isSeller = true;
  }
  
  // When role changes to seller or admin, auto-approve
  if (this.isModified('role') && (this.role === 'seller' || this.role === 'admin')) {
    this.verificationStatus = 'approved';
    this.isSeller = true;
  }
  
  // When role changes back to customer, reset seller status
  if (this.isModified('role') && this.role === 'customer') {
    this.isSeller = false;
    this.verificationStatus = 'approved';
  }
  
  next();
});

// Virtual for full name if we add firstName/lastName later
userSchema.virtual('displayName').get(function() {
  return this.companyName || this.name;
});

// Method to check if user can sell products
userSchema.methods.canSellProducts = function() {
  return this.isSeller && (this.verificationStatus === 'approved' || this.role === 'admin');
};

// Method to check if user needs verification
userSchema.methods.needsVerification = function() {
  return this.role === 'manufacturer' && this.verificationStatus === 'pending';
};

// Static method to find users needing approval
userSchema.statics.findPendingManufacturers = function() {
  return this.find({ 
    role: 'manufacturer', 
    verificationStatus: 'pending' 
  }).sort({ createdAt: -1 });
};

// Transform output to remove sensitive data
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;