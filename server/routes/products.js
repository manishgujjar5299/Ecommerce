const router = require('express').Router();
const Product = require('../models/product.model');
const auth = require('../middleware/auth'); // Basic user authentication
const manufacturerAuth = require('../middleware/manufacturerAuth'); // Manufacturer/Admin auth
const { validateProductData, validateObjectId } = require('../middleware/security'); // Validation/Security middleware
const User = require('../models/user.model');

// --- PUBLIC ROUTES ---

// GET all approved products (Shop page)
router.get('/', async (req, res) => {
    try {
        // Fetch only approved and active products
        const products = await Product.findApproved().populate('seller', 'companyName name');
        res.json(products);
    } catch (error) {
        console.error('Fetch all products error:', error);
        res.status(500).json({ msg: 'Failed to fetch products' });
    }
});

// GET a single product by ID (Product Detail page)
router.get('/:id', validateObjectId('id'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'companyName name role')
            // Don't show password if user is populated in review
            .populate('reviews.user', 'name profileImage'); 

        if (!product || product.status !== 'approved') {
            return res.status(404).json({ msg: 'Product not found or is pending approval' });
        }
        
        // Increment view count (optional: debounce this in a real app)
        product.incrementViewCount();

        res.json(product);
    } catch (error) {
        console.error('Fetch product by ID error:', error);
        res.status(500).json({ msg: 'Failed to fetch product' });
    }
});

// --- MANUFACTURER / SELLER MANAGEMENT ROUTES ---

// GET products belonging to the current user (My Products page)
router.get('/my-products', manufacturerAuth, async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error('Fetch user products error:', error);
        res.status(500).json({ msg: 'Failed to fetch your products' });
    }
});

// POST Add a new product (The Fixed Logic is here)
router.post('/add', manufacturerAuth, validateProductData, async (req, res) => {
    try {
        // Check if the user is verified to sell (handled by manufacturerAuth, but good to double-check)
        const user = await User.findById(req.user);
        if (!user.canSellProducts()) {
            return res.status(403).json({ msg: 'Your account is not approved to add products.' });
        }

        const newProduct = new Product({
            ...req.body,
            seller: req.user,
            // Status defaults to 'pending' unless user is an Admin/Approved Seller
            status: user.role === 'admin' || user.role === 'seller' ? 'approved' : 'pending' 
        });

        await newProduct.save(); // Mongoose validation runs here

        res.status(201).json({
            msg: `Product added successfully and is currently ${newProduct.status}.`,
            product: newProduct
        });

    } catch (error) {
        console.error('Product Save Error:', error);

        // FIXED: Crucial: Handle Mongoose Validation Error
        if (error.name === 'ValidationError') {
            const errors = {};
            for (const field in error.errors) {
                // Return only the message for the frontend
                errors[field] = error.errors[field].message; 
            }
            return res.status(400).json({
                msg: 'Validation failed. Please check your product data.',
                errors: errors // Send detailed field errors
            });
        }
        
        res.status(500).json({ msg: 'Internal server error while saving product' });
    }
});

// PUT Update an existing product
router.put('/update/:id', manufacturerAuth, validateObjectId('id'), validateProductData, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        // Ensure the current user is the owner
        if (product.seller.toString() !== req.user.toString() && req.userRole !== 'admin') {
            return res.status(403).json({ msg: 'You are not authorized to edit this product' });
        }
        
        // Update fields
        Object.assign(product, req.body);
        
        // If critical fields are changed, reset status to pending for re-approval (unless Admin)
        if (req.userRole !== 'admin') {
            product.status = 'pending';
        }

        await product.save();

        res.json({
            msg: `Product updated successfully. Status reset to ${product.status} for review.`,
            product
        });
    } catch (error) {
        // Handle Mongoose Validation Errors on update as well
        if (error.name === 'ValidationError') {
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message; 
            }
            return res.status(400).json({
                msg: 'Validation failed. Please check your updated data.',
                errors: errors 
            });
        }
        console.error('Product update error:', error);
        res.status(500).json({ msg: 'Failed to update product' });
    }
});

// DELETE a product
router.delete('/:id', manufacturerAuth, validateObjectId('id'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Ensure the current user is the owner
        if (product.seller.toString() !== req.user.toString() && req.userRole !== 'admin') {
            return res.status(403).json({ msg: 'You are not authorized to delete this product' });
        }

        await Product.deleteOne({ _id: req.params.id });

        res.json({ msg: 'Product removed successfully' });
    } catch (error) {
        console.error('Product delete error:', error);
        res.status(500).json({ msg: 'Failed to delete product' });
    }
});


// --- REVIEW ROUTES (Requires basic user auth) ---

// POST Add a review
router.post('/:id/reviews', auth, validateObjectId('id'), async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;

        const submittingUser = await User.findById(req.user).select('name');
        
        if (!submittingUser) {
          console.error(`User not found for ID: ${req.user}`); 
            return res.status(401).json({ msg: 'User not found or unauthorized.' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        const reviewData = {
            name: submittingUser.name, // Assuming you fetch user name from a previous step or context
            rating: Number(rating),
            comment,
            user: req.user // The ID from the token
        };

        // Use the method from product.model.js to handle adding and calculating stats
        await product.addReview(reviewData);

        res.status(201).json({ msg: 'Review added successfully' });

    } catch (error) {
        console.error('Add review error:', error);
        // Handle custom error from addReview method (e.g., duplicate review)
        if (error.message.includes('reviewed')) {
             return res.status(400).json({ msg: error.message });
        }
        // Handle Mongoose validation errors for review fields
        if (error.name === 'ValidationError') {
            return res.status(400).json({ msg: 'Review validation failed: ' + Object.values(error.errors).map(e => e.message).join(', ') });
        }
        res.status(500).json({ msg: 'Failed to add review' });
    }
});


module.exports = router;// Fixed products.js - Auto-approve products for verified manufacturers