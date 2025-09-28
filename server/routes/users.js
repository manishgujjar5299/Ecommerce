const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

// --- LOGIN ROUTE ---
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

    // Update login statistics
    user.lastLoginAt = new Date();
    user.loginCount += 1;
    await user.save();

    // Create and sign a token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    
    res.json({
      token,
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

    // Update user role and company info
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