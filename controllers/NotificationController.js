const Notification = require("../models/Notification");

// @desc    Get all notifications for a specific user
// @route   GET /api/notifications/:userId
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(10);
      console.log('notifications',notifications)
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Erreur GET notifications:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/read/:id
exports.markAsRead = async (req, res) => {
  try {
    const updatedNotif = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!updatedNotif) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }
    res.status(200).json(updatedNotif);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Erreur lors de la mise à jour", error: err.message });
  }
};

// @desc    Clear all notification history for a user
// @route   DELETE /api/notifications/clear/:userId
exports.clearUserHistory = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.params.userId });
    res.status(200).json({ message: "Historique supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression", error: err.message });
  }
};