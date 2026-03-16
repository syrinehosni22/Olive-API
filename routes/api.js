// routes/api.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes Auth
router.post('/register', authController.register);

// Routes Marketplace (Exemple)
router.get('/products', (req, res) => {
  // Logique pour lister les huiles d'olive des agriculteurs
});

// Routes Carnet d'adresses (Prestataires/Huileries)
router.get('/directory', (req, res) => {
  // Logique pour lister les huileries et prestataires
});

module.exports = router;