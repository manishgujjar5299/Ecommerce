const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['customer', 'seller', 'manufacturer', 'admin'],
    default: 'customer'
  },
  isSeller: { type: Boolean, default: false },
  companyName: { type: String },
  // companyLogo: { type: String },
  companyDescription: { type: String },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;