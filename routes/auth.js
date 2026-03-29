const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const upload = require("../middleware/upload");

// --- PUBLIC ROUTES ---

// Registration with file upload
router.post(
  "/register-with-payment",
  upload.single("rneFile"),
  authController.registerWithPayment
);

// Login: Sets the HttpOnly cookie
router.post('/login', authController.login);

// --- PERSISTENCE & SESSION ROUTES ---

// Get current user: React calls this in App.tsx useEffect to persist state
router.get('/me', authController.getMe);

// Logout: Clears the HttpOnly cookie
router.post('/logout', authController.logout);

module.exports = router;