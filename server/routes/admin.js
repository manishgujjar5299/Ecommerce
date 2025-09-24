const router = require('express').Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/user.model');
const Product = require('../models/product.model');

// Get admin dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalManufacturers, pendingApprovals] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'manufacturer' }),
      User.countDocuments({ verificationStatus: 'pending' })
    ]);

    res.json({
      totalUsers,
      totalProducts,
      totalManufacturers,
      pendingApprovals
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recent activity
router.get('/recent-activity', adminAuth, async (req, res) => {
  try {
    // Mock data for now - you can implement real activity tracking later
    const recentActivity = [
      { icon: '👤', message: 'New user registered', time: '2 hours ago' },
      { icon: '📦', message: 'New product added', time: '4 hours ago' },
      { icon: '🏭', message: 'Manufacturer approval pending', time: '6 hours ago' },
      { icon: '✅', message: 'Product approved', time: '1 day ago' },
    ];
    res.json(recentActivity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['customer', 'seller', 'manufacturer', 'admin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isSeller: role === 'seller' || role === 'manufacturer' || role === 'admin' },
      { new: true }
    ).select('-password');

    res.json({ msg: 'User role updated successfully', user });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all products for admin
router.get('/products', adminAuth, async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'name companyName role');
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve/reject manufacturer
router.put('/products/:id/status', adminAuth, async (req, res) => {
  try {
    const { Status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected'];
    
    if (!validStatuses.includes(Status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { Status },
      { new: true }
    );

    res.json({ msg: 'Manufacturer status updated successfully', product });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
