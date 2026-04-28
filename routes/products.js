const express = require('express');
const router = express.Router();

const productCtrl = require('../controllers/productController');



// ==========================================
// CREATE: Add a new product (avec upload fichiers)
// ==========================================
router.post(
  '/add',
  productCtrl.addProduct
);


// ==========================================
// READ: Get all products
// ==========================================
router.get('/', productCtrl.getAllProducts);


// ==========================================
// READ: Get one specific product by ID
// ==========================================
router.get('/:id', productCtrl.getProductById);


// ==========================================
// READ: Get products by a specific seller
// ==========================================
router.get('/seller/:sellerId', productCtrl.getProductsBySeller);


// ==========================================
// UPDATE: Edit/Update product (avec upload fichiers)
// ==========================================
router.put(
  '/edit/:id',
  productCtrl.updateProduct
);


// ==========================================
// DELETE: Remove a product
// ==========================================
router.delete('/delete/:id', productCtrl.deleteProduct);


module.exports = router;