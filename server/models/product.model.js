const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Review schema with proper validation
const reviewSchema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Reviewer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  rating: { 
    type: Number, 
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: { 
    type: String, 
    required: [true, 'Comment is required'],
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
});

// Index for reviews
reviewSchema.index({ user: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ rating: -1 });

const productSchema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters'],
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price must be positive'],
    validate: {
      validator: function(value) {
        return !value || value < this.price;
      },
      message: 'Sale price must be less than regular price'
    }
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  image: { 
    type: String, 
    required: [true, 'Image is required'],
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i, 'Please enter a valid image URL']
  },
  images: [{
    type: String,
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i, 'Please enter valid image URLs']
  }],
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    enum: {
      values: ['Electronics', 'Apparel', 'Shoes', 'Watch', 'Bags', 'Accessories', 'Home Goods', 'Groceries'],
      message: 'Category must be one of: Electronics, Apparel, Shoes, Watch, Bags, Accessories, Home Goods, Groceries'
    }
  },
  brand: { 
    type: String, 
    required: [true, 'Brand is required'],
    trim: true,
    minlength: [1, 'Brand must be at least 1 character'],
    maxlength: [50, 'Brand cannot exceed 50 characters']
  },
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Seller is required']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Status must be pending, approved, or rejected'
    },
    default: 'pending'
  },
  
  reviews: [reviewSchema],
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  // Additional useful fields
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true // Allow null values but ensure uniqueness when present
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch'],
      default: 'cm'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  salesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
});

// Indexes for better query performance
productSchema.index({ seller: 1 });
productSchema.index({ status: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' }); // Text search
productSchema.index({ 'reviews.user': 1 }); // For checking duplicate reviews

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.salePrice && this.price > this.salePrice) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

// Virtual for effective price (sale price if available, otherwise regular price)
productSchema.virtual('effectivePrice').get(function() {
  return this.salePrice || this.price;
});

// Fixed: Automatic review statistics calculation
productSchema.methods.calculateReviewStats = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
    return;
  }

  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating = Number((totalRating / this.reviews.length).toFixed(1));
  this.numReviews = this.reviews.length;
};

// Pre-save middleware to calculate review stats
productSchema.pre('save', function(next) {
  if (this.isModified('reviews')) {
    this.calculateReviewStats();
  }
  next();
});

// Method to add review with duplicate check
productSchema.methods.addReview = function(reviewData) {
  // Check if user already reviewed this product
  const existingReview = this.reviews.find(
    review => review.user.toString() === reviewData.user.toString()
  );
  
  if (existingReview) {
    throw new Error('You have already reviewed this product');
  }
  
  // Add the new review
  this.reviews.push(reviewData);
  this.calculateReviewStats();
  
  return this.save();
};

// Method to update review
productSchema.methods.updateReview = function(userId, updateData) {
  const review = this.reviews.find(
    review => review.user.toString() === userId.toString()
  );
  
  if (!review) {
    throw new Error('Review not found');
  }
  
  Object.assign(review, updateData);
  this.calculateReviewStats();
  
  return this.save();
};

// Method to remove review
productSchema.methods.removeReview = function(userId) {
  const reviewIndex = this.reviews.findIndex(
    review => review.user.toString() === userId.toString()
  );
  
  if (reviewIndex === -1) {
    throw new Error('Review not found');
  }
  
  this.reviews.splice(reviewIndex, 1);
  this.calculateReviewStats();
  
  return this.save();
};

// Static methods for common queries
productSchema.statics.findApproved = function() {
  return this.find({ status: 'approved', isActive: true });
};

productSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category: category, 
    status: 'approved', 
    isActive: true 
  });
};

productSchema.statics.findByBrand = function(brand) {
  return this.find({ 
    brand: new RegExp(brand, 'i'), 
    status: 'approved', 
    isActive: true 
  });
};

productSchema.statics.searchProducts = function(searchTerm) {
  return this.find({
    $and: [
      { status: 'approved', isActive: true },
      {
        $or: [
          { name: new RegExp(searchTerm, 'i') },
          { description: new RegExp(searchTerm, 'i') },
          { brand: new RegExp(searchTerm, 'i') },
          { category: new RegExp(searchTerm, 'i') }
        ]
      }
    ]
  });
};

// Method to increment view count
productSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save({ validateBeforeSave: false }); // Skip validation for performance
};

const Product = mongoose.model('Product', productSchema);
module.exports = Product;