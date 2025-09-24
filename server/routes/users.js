const router = require('express').Router();
const bcrypt = require('../node_modules/bcryptjs/umd');
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
    res.json(savedUser);

  } catch (err) {
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

    // Create and sign a token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        isSeller: user.isSeller,
        role: user.role || 'customer',
        companyName: user.companyName,
        verificationStatus: user.verificationStatus
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/become-manufacturer', auth, async (req, res) => {
  try {
    const { companyName, companyDescription } = req.body;
    
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    user.role = 'manufacturer';
    user.companyName = companyName;
    user.companyDescription = companyDescription;
    user.verificationStatus = 'pending';
    user.isSeller = true;
    
    await user.save();

    res.json({
      msg: 'Manufacturer application submitted! Please wait for admin approval.',
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        companyName: user.companyName,
        verificationStatus: user.verificationStatus,
        isSeller: user.isSeller
      }
    });
  } catch (err) {
    console.error('Become manufacturer error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;