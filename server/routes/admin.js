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

// Get pending manufacturers (NEW ROUTE)
router.get('/pending-manufacturers', adminAuth, async (req, res) => {
  try {
    const pendingManufacturers = await User.findPendingManufacturers();
    res.json(pendingManufacturers);
  } catch (error) {
    console.error('Get pending manufacturers error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve/Reject Manufacturer (FIXED ROUTE)
router.put('/users/:id/verify', adminAuth, async (req, res) => {
  try {
    const { verificationStatus } = req.body; // Changed from 'status' to 'verificationStatus'
    const validStatuses = ['pending', 'approved', 'rejected'];
    
    if (!validStatuses.includes(verificationStatus)) {
      return res.status(400).json({ msg: 'Invalid verification status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Only manufacturers need verification
    if (user.role !== 'manufacturer') {
      return res.status(400).json({ msg: 'Only manufacturers require verification' });
    }

    // Update verification status
    user.verificationStatus = verificationStatus;
    
    // If approved, allow selling
    if (verificationStatus === 'approved') {
      user.isSeller = true;
    } else if (verificationStatus === 'rejected') {
      // If rejected, remove seller privileges
      user.isSeller = false;
    }

    await user.save();

    res.json({ 
      msg: `Manufacturer ${verificationStatus} successfully`, 
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update verification status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['customer', 'seller', 'manufacturer', 'admin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role},
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
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status. Must be: pending, approved, or rejected' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.json({ msg: 'Product ${status} successfully', product });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
