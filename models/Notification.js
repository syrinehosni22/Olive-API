const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optionnel (ex: l'Admin)
  type: { 
    type: String, 
    enum: ["VALIDATION", "REJET", "MESSAGE", "OFFRE_MATCH"], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String }, // Ex: "/dashboard/inventory" pour rediriger l'utilisateur
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);