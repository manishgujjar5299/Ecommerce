const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin access required' });
    }

    req.user = decoded.id;
    req.userRole = user.role;
    next();
  } catch (err) {
    console.error('Admin auth error:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = adminAuth;
