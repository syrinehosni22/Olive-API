const Product = require('../models/Product');

// ==========================================
// 1. CRÉER (Create)
// ==========================================
exports.addProduct = async (req, res) => {
  try {
    const newProduct = new Product({
      ...req.body,
    });
   console.log(req.body)
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Erreur addProduct:", err);
    res.status(400).json({ message: "Erreur lors de l'ajout", error: err.message });
  }
};

// ==========================================
// 2. LIRE (Read)
// ==========================================

// Récupérer TOUS les produits
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Récupérer un produit spécifique par son ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Récupérer les produits d'un vendeur spécifique
exports.getProductsBySeller = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.params.sellerId })
                                  .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ==========================================
// 3. METTRE À JOUR (Update)
// ==========================================
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true } 
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Produit non trouvé" });
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
    
    if (!deletedProduct) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    res.status(200).json({ message: "Produit supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression", error: err.message });
  }
};