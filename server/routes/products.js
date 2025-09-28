const router = require('express').Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const manufacturerAuth = require('../middleware/manufacturerAuth');

let Product = require('../models/product.model');
let User = require('../models/user.model');

// --- GET ALL APPROVED PRODUCTS (Public Route) ---
// This is the main shop page route. It only shows products that have been approved by the admin.
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: 'approved' }).populate('seller', 'name companyName');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET A SINGLE PRODUCT BY ID (Public Route) ---
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name companyName');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ msg: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET ALL PRODUCTS FOR ADMIN REVIEW (Protected Admin Route) ---
// This route is for the admin dashboard to see all products, regardless of status.
router.get('/admin/all-products', adminAuth, async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'name companyName');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- GET PRODUCTS BY SELLER/MANUFACTURER (Protected Route) ---
// This route is for the manufacturer dashboard to see only their own products.
router.get('/user/my-products', auth, async (req, res) => {
  try {
    const myProducts = await Product.find({ seller: req.user }).populate('seller', 'name');
    res.json(myProducts);
  } catch (err) {
    console.error('My products error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- ADD A NEW PRODUCT (Protected Manufacturer Route) ---
// Only manufacturers can add products. Added a check for 'manufacturer' role.
router.post('/add', auth, async (req, res) => {
  try {
    const { name, price, description, image, category, brand } = req.body;
    
    if (!name || !price || !description || !image || !category || !brand) {
      return res.status(400).json({ msg: 'All fields are required.' });
    }

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // FIXED: Allow manufacturers to add products
    const canAddProducts = user.role === 'admin' || 
                          user.role === 'seller' || 
                          (user.role === 'manufacturer' && user.verificationStatus === 'approved');
    
    if (!canAddProducts) {
      if (user.role === 'manufacturer' && user.verificationStatus === 'pending') {
        return res.status(403).json({ 
          msg: 'Your manufacturer account is pending admin approval. Please wait for verification.' 
        });
      } else if (user.role === 'manufacturer' && user.verificationStatus === 'rejected') {
        return res.status(403).json({ 
          msg: 'Your manufacturer account has been rejected. Please contact admin.' 
        });
      } else {
        return res.status(403).json({ 
          msg: 'Only approved sellers/manufacturers can add products' 
        });
      }
    }

    // Set product status based on user role
    let productStatus = 'pending'; // Default
    if (user.role === 'admin') {
      productStatus = 'approved'; // Admins can directly approve
    }

    const newProduct = new Product({
      name,
      price: Number(price),
      description,
      image,
      category,
      brand,
      seller: req.user,
      status: productStatus // Products are 'pending' by default and must be approved by admin.
    });

    const savedProduct = await newProduct.save();
    const message = user.role === 'admin' 
      ? 'Product added and approved successfully!' 
      : 'Product added successfully! Awaiting admin approval.';


    res.status(201).json({
      msg: message,
      product: savedProduct
    });

  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- CREATE A NEW REVIEW (Protected Route) ---
router.post('/:id/reviews', auth, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user.toString());

      if (alreadyReviewed) {
        return res.status(400).json({ msg: 'Product already reviewed' });
      }

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
      const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
      product.rating = totalRating / product.reviews.length;

      await product.save();
      res.status(201).json({ msg: 'Review added' });
    } else {
      res.status(404).json({ msg: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- UPDATE PRODUCT (Protected Manufacturer Route) ---
router.put('/update/:id', manufacturerAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

     const user = await User.findById(req.user);
    
    // Check ownership or admin privileges
    const canEdit = user.role === 'admin' || product.seller.toString() === req.user.toString();
    
    if (!canEdit) {
      return res.status(403).json({ msg: 'Access denied. You can only update your own products.' });
    }


    // If manufacturer updates, set status back to pending (unless admin)
    const updateData = { ...req.body };
    if (user.role !== 'admin') {
      updateData.status = 'pending';
    }
    // if (product.seller.toString() !== req.user.toString()) {
    //   return res.status(403).json({ msg: 'Access denied. You can only update your own products.' });
    // }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData, // Status reverts to pending on update, awaiting re-approval.
      { new: true }
    );

    const message = user.role === 'admin' 
      ? 'Product updated successfully!' 
      : 'Product updated successfully! Awaiting re-approval.';

    res.json({
      msg: message,
      product: updatedProduct
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DELETE PRODUCT (Protected Manufacturer Route) ---
router.delete('/:id', manufacturerAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    const user = await User.findById(req.user);
    const canDelete = user.role === 'admin' || product.seller.toString() === req.user.toString();
    
    if (!canDelete) {
      return res.status(403).json({ msg: 'Access denied. You can only delete your own products.' });
    }

    // if (product.seller.toString() !== req.user.toString()) {
    //   return res.status(403).json({ msg: 'Access denied. You can only delete your own products.' });
    // }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Product deleted successfully!' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;