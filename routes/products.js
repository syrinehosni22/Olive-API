const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/productController');

// CREATE: Add a new product
router.post('/add', productCtrl.addProduct);

// READ: Get all products
// GET : http://localhost:5000/api/products/
router.get('/', productCtrl.getAllProducts);

// READ: Get one specific product by ID
router.get('/:id', productCtrl.getProductById);

// READ: Get products by a specific seller
router.get('/seller/:sellerId', productCtrl.getProductsBySeller);

// UPDATE: Edit/Update an existing product
router.put('/edit/:id', productCtrl.updateProduct);

// DELETE: Remove a product
router.delete('/delete/:id', productCtrl.deleteProduct);

module.exports = router;