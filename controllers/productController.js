const Product = require('../models/product');
const Notification = require("../models/Notification");
const fs = require('fs');
const path = require('path');

// ==============================
// 🛠 UTILS
// ==============================

/**
 * Décode une chaîne Base64 et l'enregistre sur le disque
 * @param {string} base64String - Le contenu du fichier
 * @param {string} subFolder - Sous-dossier (ex: 'documents')
 * @returns {string|null} - Le chemin relatif du fichier enregistré
 */
const saveBase64 = (base64String, subFolder = 'products') => {
  if (!base64String || !base64String.startsWith('data:')) return null;

  try {
    // 1. Extraire l'extension et les données
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;

    const extension = matches[1].split('/')[1] === 'pdf' ? 'pdf' : 'jpg';
    const data = Buffer.from(matches[2], 'base64');

    // 2. Créer les dossiers s'ils n'existent pas
    const uploadDir = path.join(__dirname, '../uploads', subFolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 3. Générer un nom unique
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${extension}`;
    const filePath = path.join(uploadDir, fileName);

    // 4. Écrire le fichier
    fs.writeFileSync(filePath, data);

    // Retourner le chemin relatif pour la DB
    return `uploads/${subFolder}/${fileName}`;
  } catch (error) {
    console.error("Erreur saveBase64:", error);
    return null;
  }
};

const cleanObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj || {}).filter(([_, v]) => v !== undefined)
  );
};

// ==========================================
// 1. CRÉER (Accepte Base64)
// ==========================================
exports.addProduct = async (req, res) => {
  try {
    let data = { ...req.body };

    // 📂 Traitement des fichiers Base64 (si présents dans l'objet imbriqué)
    // On mappe les champs envoyés par le front en Base64 vers des liens fichiers
    if (data.traceability?.fileUrlTraceabilite) {
      data.traceability.fileUrlTraceabilite = saveBase64(data.traceability.fileUrlTraceabilite);
    }
    if (data.physicoChimique?.fileUrlAnalyse) {
      data.physicoChimique.fileUrlAnalyse = saveBase64(data.physicoChimique.fileUrlAnalyse);
    }
    if (data.organoleptique?.fileUrlPanelTest) {
      data.organoleptique.fileUrlPanelTest = saveBase64(data.organoleptique.fileUrlPanelTest);
    }
    if (data.purete?.fileUrlPurete) {
      data.purete.fileUrlPurete = saveBase64(data.purete.fileUrlPurete);
    }

    const newProduct = new Product(data);
    const savedProduct = await newProduct.save();

    // 🔔 Notification
    const notificationCommunaute = new Notification({
      recipient: null,
      type: "OFFRE_MATCH",
      title: "Nouveau lot disponible",
      message: `Un nouveau lot de ${data.physicoChimique?.variety || "produit"} vient d'être publié.`,
      link: "/market",
      isRead: false
    });

    await notificationCommunaute.save();

    const io = req.app.get('socketio');
    if (io) io.to("buyers").emit('newNotification', notificationCommunaute);

    res.status(201).json(savedProduct);

  } catch (err) {
    console.log(err)
    res.status(400).json({ message: "Erreur lors de l'ajout", error: err.message });
  }
};

// ==========================================
// 5. UPDATE (Accepte Base64)
// ==========================================
exports.updateProduct = async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) return res.status(404).json({ message: "Produit non trouvé" });

    let updateData = req.body; // On garde la structure imbriquée
    console.log(req.body)

    // 📂 Traitement Base64 : On n'écrase que si un nouveau Base64 est envoyé
    if (updateData.traceability?.fileUrlTraceabilite?.startsWith('data:')) {
      updateData.traceability.fileUrlTraceabilite = saveBase64(updateData.traceability.fileUrlTraceabilite);
    }
    if (updateData.physicoChimique?.fileUrlAnalyse?.startsWith('data:')) {
      updateData.physicoChimique.fileUrlAnalyse = saveBase64(updateData.physicoChimique.fileUrlAnalyse);
    }
    if (updateData.organoleptique?.fileUrlPanelTest?.startsWith('data:')) {
      updateData.organoleptique.fileUrlPanelTest = saveBase64(updateData.organoleptique.fileUrlPanelTest);
    }
    if (updateData.purete?.fileUrlPurete?.startsWith('data:')) {
      updateData.purete.fileUrlPurete = saveBase64(updateData.purete.fileUrlPurete);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // 🔔 Logique Notifications Statut
    if (req.body.status && req.body.status !== oldProduct.status) {
      // ... (ton code de notification reste identique)
      const io = req.app.get('socketio');
      // Envoi socket io...
    }

    res.status(200).json(updatedProduct);

  } catch (err) {
    res.status(400).json({ message: "Erreur modification", error: err.message });
  }
}

// ==========================================
// 2. LIRE (GET ALL + FILTRES AVANCÉS)
// ==========================================
exports.getAllProducts = async (req, res) => {
  try {
    const filters = req.query;
    let query = {};

    // 🔍 filtres avancés marketplace
    if (filters.variety)
      query["traceability.variety"] = filters.variety;

    if (filters.campaign)
      query["traceability.campaign"] = filters.campaign;

    if (filters.acidityMax)
      query["physicoChimique.acidity"] = { $lte: Number(filters.acidityMax) };

    if (filters.polyphenols)
      query["qualiteCommerciale.polyphenols"] = filters.polyphenols;

    if (filters.incoterm)
      query["logistique.incoterm"] = filters.incoterm;

    if (filters.port)
      query["logistique.port"] = filters.port;

    if (filters.status)
      query.status = filters.status;

    if (filters.isVerified)
      query["trust.isVerifiedSeller"] = filters.isVerified === "true";

    const products = await Product.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json(products);

  } catch (err) {
    res.status(500).json({
      message: "Erreur serveur",
      error: err.message
    });
  }
};

// ==========================================
// 3. LIRE PAR ID
// ==========================================
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Produit non trouvé" });

    res.status(200).json(product);

  } catch (err) {
    res.status(500).json({
      message: "Erreur récupération",
      error: err.message
    });
  }
};

// ==========================================
// 4. PRODUITS PAR VENDEUR
// ==========================================
exports.getProductsBySeller = async (req, res) => {
  try {
    const products = await Product.find({
      sellerId: req.params.sellerId
    }).sort({ createdAt: -1 });

    res.status(200).json(products);

  } catch (err) {
    res.status(500).json({
      message: "Erreur serveur",
      error: err.message
    });
  }
};


// ==========================================
// 6. DELETE
// ==========================================
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct)
      return res.status(404).json({ message: "Produit non trouvé" });

    res.status(200).json({
      message: "Produit supprimé avec succès"
    });

  } catch (err) {
    res.status(500).json({
      message: "Erreur suppression",
      error: err.message
    });
  }
};