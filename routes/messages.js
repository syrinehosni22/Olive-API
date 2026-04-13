const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// Récupérer l'historique entre deux personnes
router.get("/history/:userId/:contactId", messageController.getChatHistory);

// Récupérer la liste des conversations pour la sidebar
router.get("/contacts/:userId", messageController.getUserContacts);

module.exports = router;