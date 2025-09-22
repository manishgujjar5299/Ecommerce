// Complete products.js route file with ADD product function

const router = require('express').Router();
const auth = require('../middleware/auth');
let Product = require('../models/product.model');
let User = require('../models/user.model');

// --- GET ALL PRODUCTS (Public Route) ---
router.route('/').get(async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'name');
    res.json(products);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// --- GET A SINGLE PRODUCT BY ID (Public Route) ---
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ msg: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADD A NEW PRODUCT (Seller-Only Route) ---
router.post('/add', auth, async (req, res) => {
  try {
    const { name, price, description, image, category, brand } = req.body;

    // Check if user is a seller
    const user = await User.findById(req.user);
    if (!user || !user.isSeller) {
      return res.status(403).json({ msg: 'Access denied. Only sellers can add products.' });
    }

    // Create new product
    const newProduct = new Product({
      name,
      price,
      description,
      image,
      category,
      brand,
      seller: req.user, // Set the seller to the authenticated user
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({
      msg: 'Product added successfully!',
      product: savedProduct
    });

  } catch (err) {
    console.error('Add product error:', err); 
    res.status(500).json({ error: err.message });
  }
});

// --- GET PRODUCTS BY SELLER (Protected Route) ---
router.get('/my-products', auth, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user }).populate('seller', 'name');
    res.json(products);
  } catch (err) {
    console.error('My products error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- CREATE A NEW REVIEW (Protected Route) ---
router.post('/:id/reviews', auth, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if the user has already reviewed this product
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ msg: 'Product already reviewed' });
      }

      // Get user's name to store with the review
      const user = await User.findById(req.user);

      const review = {
        name: user.name,
        rating: Number(rating),
        comment,
        user: req.user,
      };

      product.reviews.push(review);

      // Update the number of reviews and overall rating
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ msg: 'Review added' });
    } else {
      res.status(404).json({ msg: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- UPDATE PRODUCT (Seller-Only Route) ---
router.put('/update/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if the user is the seller of this product
    if (product.seller.toString() !== req.user.toString()) {
      return res.status(403).json({ msg: 'Access denied. You can only update your own products.' });
    }

    const { name, price, description, image, category, brand } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, description, image, category, brand },
      { new: true }
    );

    res.json({
      msg: 'Product updated successfully!',
      product: updatedProduct
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DELETE PRODUCT (Seller-Only Route) ---
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if the user is the seller of this product
    if (product.seller.toString() !== req.user.toString()) {
      return res.status(403).json({ msg: 'Access denied. You can only delete your own products.' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Product deleted successfully!' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;