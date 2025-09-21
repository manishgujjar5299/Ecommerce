// server/routes/products.js
const router = require('express').Router();
const auth = require('../middleware/auth');
let Product = require('../models/product.model');
let User = require('../models/user.model');

// --- GET ALL PRODUCTS (Public Route) ---
router.route('/').get(async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'name'); // Also get seller's name
    res.json(products);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

router.get('/my-products', auth, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user }).populate('seller', 'name');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADD A NEW PRODUCT (Seller-Only Route) ---
router.post('/add', auth, async (req, res) => {
  try {
    // Check if the user is a seller
    const user = await User.findById(req.user);
    if (!user.isSeller) {
      return res.status(403).json({ msg: 'Access denied. You are not a seller.' });
    }

    const { name, price, description, image, category, brand } = req.body;
    const newProduct = new Product({
      name,
      price,
      description,
      image,
      category,
      brand,
      seller: req.user, // Link product to the logged-in user
    });

    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- UPDATE A PRODUCT (Seller-Only Route) ---
router.put('/update/:id', auth, async (req, res) => {
    // Logic to update a product, ensuring the user owns it
    // (We can build this out later)
    res.json({ msg: "Update route placeholder" });
});

// --- DELETE A PRODUCT (Seller-Only Route) ---
router.delete('/:id', auth, async (req, res) => {
    // Logic to delete a product, ensuring the user owns it
    // (We can build this out later)
    res.json({ msg: "Delete route placeholder" });
});


module.exports = router;