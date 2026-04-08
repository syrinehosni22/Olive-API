const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController")


router.get('/profile/:id', userController.getProfile);
router.patch('/profile', userController.updateProfile);

module.exports = router;