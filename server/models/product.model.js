const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  rating: { type: Number, required: true },
  brand: { type: String, required: true },
   seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;