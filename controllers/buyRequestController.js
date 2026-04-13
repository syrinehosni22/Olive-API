const BuyRequest = require("../models/BuyRequest");

// @desc    Créer un nouvel appel d'offre (Acheteur)
// @route   POST /api/buy-requests/add
exports.createBuyRequest = async (req, res) => {
  try {
    const newRequest = new BuyRequest(req.body);
    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la création de l'offre", error: error.message });
  }
};

// @desc    Récupérer tous les appels d'offres (pour les vendeurs)
// @route   GET /api/buy-requests
exports.getAllBuyRequests = async (req, res) => {
  try {
    const requests = await BuyRequest.find()
      .populate("buyerId", "firstName name companyName") // Pour savoir qui achète
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// @desc    Récupérer une offre par ID (Détails)
// @route   GET /api/buy-requests/:id
exports.getBuyRequestById = async (req, res) => {
  try {
    const request = await BuyRequest.findById(req.params.id).populate("buyerId", "firstName name companyName email phone");
    if (!request) {
      return res.status(404).json({ message: "Appel d'offre non trouvé" });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "ID invalide ou erreur serveur", error: error.message });
  }
};

// @desc    Récupérer les offres d'un acheteur spécifique
// @route   GET /api/buy-requests/my-requests/:buyerId
exports.getBuyerRequests = async (req, res) => {
  try {
    const requests = await BuyRequest.find({ buyerId: req.params.buyerId });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// @desc    Mettre à jour un appel d'offre
// @route   PUT /api/buy-requests/:id
exports.updateBuyRequest = async (req, res) => {
  try {
    const updatedRequest = await BuyRequest.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // On met à jour avec les données reçues
      { new: true, runValidators: true } // new: true renvoie l'objet modifié
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Appel d'offre non trouvé" });
    }

    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(400).json({ 
      message: "Erreur lors de la mise à jour", 
      error: error.message 
    });
  }
};