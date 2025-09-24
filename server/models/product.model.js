const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// We create a separate schema for the reviews
const reviewSchema = new Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // These are the new fields for reviews
  reviews: [reviewSchema], // An array of review objects
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },

}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;