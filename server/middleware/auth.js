const JWTConfig = require('../config/jwt'); // FIXED: Import the custom JWT config

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    // FIXED: Use the centralized JWTConfig service for Access Token verification
    const decoded = JWTConfig.verifyAccessToken(token); 
    req.user = decoded.id;
    next();
  } catch (err) {
    // Log detailed error to console, but send generic to client
    console.error('Auth verification error:', err.message);
    // Token is invalid (e.g., expired, wrong secret, wrong format)
    res.status(401).json({ msg: 'Token is not valid or has expired' }); 
  }
};