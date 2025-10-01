const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const manufacturerAuth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
     if (!user || !user.canSellProducts()) { 
      return res.status(403).json({ msg: 'Manufacturer or Admin access required (and must be approved)' });
    }

    req.user = decoded.id;
    req.userRole = user.role;
    next();
  } catch (err) {
    console.error('Manufacturer auth error:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = manufacturerAuth;
