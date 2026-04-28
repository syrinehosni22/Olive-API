const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");




// ==========================================
// REGISTER (avec upload fichier RNE)
// ==========================================
router.post(
  "/register-with-payment",
  authController.registerWithPayment
);


// ==========================================
// LOGIN
// ==========================================
router.post('/login', authController.login);


// ==========================================
// GET CURRENT USER
// ==========================================
router.get('/me', authController.getMe);


// ==========================================
// LOGOUT
// ==========================================
router.post('/logout', authController.logout);


module.exports = router;