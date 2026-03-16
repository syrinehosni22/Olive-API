const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const upload = require("../middleware/upload");

router.post(
  "/register-with-payment",
  upload.single("rneFile"),
  authController.registerWithPayment
);

module.exports = router;