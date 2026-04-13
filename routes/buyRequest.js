const express = require("express");
const router = express.Router();
const { 
  createBuyRequest, 
  getAllBuyRequests, 
  getBuyRequestById,
  getBuyerRequests,
  updateBuyRequest // <--- Ajouté ici
} = require("../controllers/buyRequestController");

router.post("/add", createBuyRequest);
router.get("/", getAllBuyRequests);
router.get("/:id", getBuyRequestById);
router.get("/my-requests/:buyerId", getBuyerRequests);

// --- NOUVELLE ROUTE PUT ---
router.put("/edit/:id", updateBuyRequest);

module.exports = router;