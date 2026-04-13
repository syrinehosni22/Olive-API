const Product = require('../models/product');
const Notification = require("../models/Notification");

// ==========================================
// 1. CRÉER (Ajout produit + Notification aux Acheteurs)
// ==========================================
exports.addProduct = async (req, res) => {
  try {
    const newProduct = new Product({ ...req.body });
    const savedProduct = await newProduct.save();

    // 1. Création de la notification en DB
    const notificationCommunaute = new Notification({
      recipient: null, // Public pour les acheteurs
      type: "OFFRE_MATCH",
      title: "Nouveau lot disponible",
      message: `Un nouveau lot de ${req.body.physicoChimique?.variety || "produit"} vient d'être publié.`,
      link: "/market",
      isRead: false
    });

    const savedNotif = await notificationCommunaute.save();

    const io = req.app.get('socketio');
    if (io) {
      // 2. ENVOI À LA ROOM "buyers" (Acheteurs)
      // Seuls ceux qui ont le rôle acheteur recevront ce toast
      io.to("buyers").emit('newNotification', savedNotif);
    }

    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de l'ajout", error: err.message });
  }
};

// ==========================================
// 2. LIRE (Read)
// ==========================================
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Produit non trouvé" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération", error: err.message });
  }
};

exports.getProductsBySeller = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.params.sellerId }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ==========================================
// 3. METTRE À JOUR (Update + Notification au Vendeur)
// ==========================================
exports.updateProduct = async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) return res.status(404).json({ message: "Produit non trouvé" });

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (req.body.status && req.body.status !== oldProduct.status) {
      let title = "Mise à jour de votre lot";
      let msg = `Le statut de votre lot n°${updatedProduct.traceability?.lotNumber} est passé à : ${updatedProduct.status}`;
      let type = "INFO";

      if (updatedProduct.status === "Validé") {
        type = "VALIDATION";
        title = "Lot Approuvé !";
        msg = `Félicitations, votre lot n°${updatedProduct.traceability?.lotNumber} a été validé et est maintenant visible sur le marché.`;
      } else if (updatedProduct.status === "Rejeté") {
        type = "REJET";
        title = "Lot Refusé";
        msg = `Votre lot n°${updatedProduct.traceability?.lotNumber} a été rejeté. Motif : ${updatedProduct.validationDetails?.rejectionReason || "Non spécifié"}.`;
      }

      const statusNotification = new Notification({
        recipient: updatedProduct.sellerId,
        type: type,
        title: title,
        message: msg,
        link: "/inventory",
        isRead: false
      });

      const savedNotif = await statusNotification.save();

      const io = req.app.get('socketio');
      if (io) {
        // ENVOI À LA ROOM PERSONNELLE DU VENDEUR (son ID)
        // Ou io.to("sellers") si tu veux notifier tous les vendeurs, 
        // mais ici on cible le propriétaire du produit.
        io.to(updatedProduct.sellerId.toString()).emit('newNotification', savedNotif);
      }
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la modification", error: err.message });
  }
};

// ==========================================
// 4. SUPPRIMER (Delete)
// ==========================================
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Produit non trouvé" });
    
    res.status(200).json({ message: "Produit supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression", error: err.message });
  }
};