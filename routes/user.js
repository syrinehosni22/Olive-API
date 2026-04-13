const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// --- ROUTES EXISTANTES ---
router.get('/providers', userController.getProviders);
router.get('/profile/:id', userController.getProfile);
router.patch('/profile', userController.updateProfile);

// --- NOUVELLES ROUTES ADMIN ---
// Route pour récupérer TOUS les utilisateurs
router.get('/', userController.getAllUsers);

// Route pour mettre à jour le statut d'un utilisateur spécifique
router.patch('/:id/status', userController.updateUserStatus);

module.exports = router;