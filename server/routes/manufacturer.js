const router = require('express').Router();
const manufacturerAuth = require('../middleware/manufacturerAuth');
const User = require('../models/user.model');
const Product = require('../models/product.model');

// Get manufacturer dashboard stats
router.get('/stats', manufacturerAuth, async (req, res) => {
  try {
    const [totalProducts, approvedProducts, pendingProducts] = await Promise.all([
      Product.countDocuments({ seller: req.user }),
      Product.countDocuments({ seller: req.user, status: 'approved' }),
      Product.countDocuments({ seller: req.user, status: 'pending' })
    ]);

    // Mock total views for now
    const totalViews = totalProducts * 127; // You can implement real view tracking

    res.json({
      totalProducts,
      approvedProducts,
      pendingProducts,
      totalViews
    });
  } catch (error) {
    console.error('Manufacturer stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recent products
router.get('/recent-products', manufacturerAuth, async (req, res) => {
  try {
    const recentProducts = await Product.find({ seller: req.user })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('name price image status');
    
    res.json(recentProducts);
  } catch (error) {
    console.error('Recent products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update manufacturer profile
// router.put('/profile', manufacturerAuth, async (req, res) => {
//   try {
//     const { companyName, companyLogo, companyDescription } = req.body;
    
//     const user = await User.findByIdAndUpdate(
//       req.user,
//       { companyName, companyLogo, companyDescription },
//       { new: true }
//     ).select('-password');

//     res.json({ msg: 'Profile updated successfully', user });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

module.exports = router;
