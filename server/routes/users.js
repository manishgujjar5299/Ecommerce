const router = require('express').Router();
const bcrypt = require('bcryptjs');
const JWTConfig = require('../config/jwt'); // FIXED: Custom JWT class import
let User = require('../models/user.model');
const auth = require('../middleware/auth');

// --- REGISTRATION ROUTE ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ msg: 'An account with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    
    // Remove password from response
    const userResponse = savedUser.toJSON();
    res.json(userResponse);

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- LOGIN ROUTE (UPDATED for Dual Tokens) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ msg: 'No account with this email has been registered.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials.' });
    }

    // FIXED: Generate Access Token and Refresh Token
    const { accessToken, refreshToken } = JWTConfig.generateTokens({ id: user._id });

    // Update login statistics
    user.lastLoginAt = new Date();
    user.loginCount += 1;
    await user.save();

    res.json({
      token: accessToken, // Access Token
      refreshToken: refreshToken, // Refresh Token
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'customer',
        isSeller: user.isSeller,
        companyName: user.companyName,
        verificationStatus: user.verificationStatus
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- TOKEN REFRESH ROUTE (NEW) ---
router.post('/token/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ msg: 'Refresh Token is required' });
  }

  try {
    // 1. Verify the Refresh Token using the refresh secret
    const decoded = JWTConfig.verifyRefreshToken(refreshToken);
    const userId = decoded.id;

    // 2. Check if user still exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ msg: 'Invalid refresh token payload' });
    }

    // 3. Generate a new set of tokens (Access and new Refresh Token)
    const newTokens = JWTConfig.generateTokens({ id: userId });

    res.json({
      token: newTokens.accessToken,
      refreshToken: newTokens.refreshToken // Send the newly rotated refresh token
    });

  } catch (err) {
    console.error('Token refresh error:', err.message);
    // 403 status is used for expired/invalid tokens when re-authentication is needed
    res.status(403).json({ msg: 'Invalid or expired refresh token. Please log in again.' });
  }
});

// --- BECOME MANUFACTURER ROUTE ---
router.post('/become-manufacturer', auth, async (req, res) => {
  try {
    const { companyName, companyDescription } = req.body;
    
    // Validation
    if (!companyName || !companyDescription) {
      return res.status(400).json({ msg: 'Company name and description are required.' });
    }

    if (companyName.length < 2 || companyName.length > 200) {
      return res.status(400).json({ msg: 'Company name must be between 2 and 200 characters.' });
    }

    if (companyDescription.length < 10 || companyDescription.length > 1000) {
      return res.status(400).json({ msg: 'Company description must be between 10 and 1000 characters.' });
    }

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    // Check if user is already a manufacturer
    if (user.role === 'manufacturer') {
      return res.status(400).json({ 
        msg: 'You are already a manufacturer.',
        user: user.toJSON()
      });
    }

    // Update user role and company info (pre-save middleware handles verificationStatus)
    user.role = 'manufacturer';
    user.companyName = companyName;
    user.companyDescription = companyDescription;
    
    await user.save();

    res.json({
      msg: 'Manufacturer application submitted successfully! Please wait for admin approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        companyDescription: user.companyDescription,
        verificationStatus: user.verificationStatus,
        isSeller: user.isSeller
      }
    });
  } catch (err) {
    console.error('Become manufacturer error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- LEGACY BECOME SELLER ROUTE ---
router.post('/become-seller', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    // Check if user is already a seller
    if (user.isSeller) {
      return res.status(400).json({ 
        msg: 'You are already a seller.',
        user: user.toJSON()
      });
    }

    // Update user to seller role
    user.role = 'seller';
    
    await user.save();

    res.json({
      msg: 'Congratulations! You are now a seller.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        isSeller: user.isSeller
      }
    });
  } catch (err) {
    console.error('Become seller error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- GET USER PROFILE ---
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    const userResponse = user.toJSON();
    res.json(userResponse);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- UPDATE USER PROFILE ---
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phoneNumber, address, profileImage } = req.body;
    
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    const userResponse = user.toJSON();
    res.json({
      msg: 'Profile updated successfully.',
      user: {userResponse}
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;