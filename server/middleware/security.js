const validator = require('validator');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// HTML sanitization function
const sanitizeHtml = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove HTML tags and escape special characters
  return validator.escape(input.trim());
};

// Deep sanitize object
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  
  const sanitized = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {

      if (key.startsWith('$') || key.startsWith('.')) {
          console.warn(`Security Warning: Filtered out invalid key: ${key}`);
          continue; 
      }
      
      if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeHtml(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitized[key] = sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
  }
  
  return sanitized;
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  try {
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    console.error('Input sanitization error:', error);
    res.status(400).json({ msg: 'Invalid input data' });
  }
};

// Validate specific fields
const validateProductData = (req, res, next) => {
  const { name, price, description, image, category, brand } = req.body;
  const errors = [];
  
  // Validate product name
  if (!name || name.length < 2 || name.length > 200) {
    errors.push('Product name must be between 2 and 200 characters');
  }
  
  // Validate price
  if (!price || isNaN(price) || price <= 0) {
    errors.push('Price must be a positive number');
  }
  
  // Validate description
  if (!description || description.length < 10 || description.length > 2000) {
    errors.push('Description must be between 10 and 2000 characters');
  }
  
  // Validate image URL
  if (!image || !validator.isURL(image)) {
    errors.push('Valid image URL is required');
  }
  
  // Validate category
  const validCategories = ['Electronics', 'Apparel', 'Shoes', 'Watch', 'Bags', 'Accessories', 'Home Goods', 'Groceries'];
  if (!category || !validCategories.includes(category)) {
    errors.push('Valid category is required');
  }
  
  // Validate brand
  if (!brand || brand.length < 1 || brand.length > 50) {
    errors.push('Brand must be between 1 and 50 characters');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ msg: 'Validation errors', errors });
  }
  
  next();
};

// Validate user registration data
const validateUserData = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];
  
  // Validate name
  if (!name || name.length < 2 || name.length > 100) {
    errors.push('Name must be between 2 and 100 characters');
  }
  
  // Validate email
  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }
  
  // Validate password
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  // Check for weak passwords
  if (password && (password.includes('123456') || password.toLowerCase().includes('password'))) {
    errors.push('Password is too weak');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ msg: 'Validation errors', errors });
  }
  
  next();
};

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { msg: message },
  standardHeaders: true,
  legacyHeaders: false,
});

// Different rate limits for different endpoints
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again later'
);

const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many requests from this IP, please try again later'
);

const productLimiter = createRateLimit(
  60 * 1000, // 1 minute
  10, // 10 product additions per minute
  'Too many product submissions, please slow down'
);

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-eval'"], // For React dev mode
      connectSrc: ["'self'", "http://localhost:5000", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // For React dev mode
});

// Validate MongoDB ObjectId
const validateObjectId = (paramName) => (req, res, next) => {
  const id = req.params[paramName];
  
  if (!validator.isMongoId(id)) {
    return res.status(400).json({ msg: 'Invalid ID format' });
  }
  
  next();
};

// SQL injection prevention (even though we're using MongoDB)
const preventInjection = (req, res, next) => {
  const checkForInjection = (obj) => {
    if (typeof obj === 'string') {
      // Check for common injection patterns
      const injectionPatterns = [
        /(\$where|\$regex|\$ne|\$gt|\$gte|\$lt|\$lte|\$in|\$nin)/i,
        /(javascript:|eval\(|setTimeout\(|setInterval\()/i,
        /(<script|<iframe|<object|<embed)/i
      ];
      
      return injectionPatterns.some(pattern => pattern.test(obj));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(value => checkForInjection(value));
    }
    
    return false;
  };
  
  if (checkForInjection(req.body) || checkForInjection(req.query)) {
    return res.status(400).json({ msg: 'Invalid input detected' });
  }
  
  next();
};

// Log security events
const logSecurityEvent = (eventType, req, details = {}) => {
  const logData = {
    timestamp: new Date().toISOString(),
    eventType,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method,
    userId: req.user || null,
    details
  };
  
  console.warn('SECURITY EVENT:', JSON.stringify(logData));
  
  // In production, you might want to send this to a logging service
  // or store in a separate security logs collection
};

module.exports = {
  sanitizeInput,
  validateProductData,
  validateUserData,
  authLimiter,
  generalLimiter,
  productLimiter,
  securityHeaders,
  validateObjectId,
  preventInjection,
  logSecurityEvent
};