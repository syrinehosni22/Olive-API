const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  clearUserHistory
} = require("../controllers/NotificationController");

// Routes
router.get("/:userId", getUserNotifications);
router.put("/read/:id", markAsRead);
router.delete("/clear/:userId", clearUserHistory);

module.exports = router;