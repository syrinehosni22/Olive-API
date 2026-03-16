const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const upload = require("../middleware/upload");

router.post(
  "/register-with-payment",
  upload.single("rneFile"),
  authController.registerWithPayment
);
router.post('/login', authController.login);
module.exports = router;