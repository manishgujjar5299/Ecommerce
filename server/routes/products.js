const router = require('express').Router();
let Product = require('../models/product.model');

// GET ALL PRODUCTS (already exists)
router.route('/').get((req, res) => {
  Product.find()
    .then(products => res.json(products))
    .catch(err => res.status(400).json('Error: ' + err));
});

// ✅ ADD THIS NEW ROUTE TO GET A SINGLE PRODUCT BY ID
router.route('/:id').get((req, res) => {
  Product.findById(req.params.id)
    .then(product => res.json(product))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;