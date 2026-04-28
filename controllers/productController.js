const Product = require('../models/product');
const Notification = require("../models/Notification");
const fs = require('fs');
const path = require('path');

// ==============================
// 🛠 UTILS PRIVÉS
// ==============================

/**
 * Décode une chaîne Base64 et l'enregistre sur le disque.
 * Si la chaîne est déjà une URL (ne commence pas par data:), elle est retournée telle quelle.
 */
const saveBase64 = (base64String, subFolder = 'products') => {
    if (!base64String) return null;
    
    // Si c'est déjà une URL, on ne fait rien
    if (!base64String.startsWith('data:')) return base64String;

    try {
        // 1. Extraire l'extension et les données
        const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) return null;

        const mimeType = matches[1];
        const extension = mimeType.split('/')[1] === 'pdf' ? 'pdf' : 'jpg';
        const data = Buffer.from(matches[2], 'base64');

        // 2. Créer les dossiers s'ils n'existent pas
        const uploadDir = path.join(__dirname, '../uploads', subFolder);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // 3. Générer un nom unique
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${extension}`;
        const filePath = path.join(uploadDir, fileName);

        // 4. Écrire le fichier physiquement
        fs.writeFileSync(filePath, data);

        // Retourner le chemin relatif pour la DB
        return `uploads/${subFolder}/${fileName}`;
    } catch (error) {
        console.error("Erreur critique saveBase64:", error);
        return null;
    }
};

/**
 * Parcourt l'objet de données et remplace les Base64 par des URLs pour tous les champs connus
 */
const processAllFiles = (data) => {
    if (!data) return data;

    if (data.traceability?.fileUrlTraceabilite) {
        data.traceability.fileUrlTraceabilite = saveBase64(data.traceability.fileUrlTraceabilite, 'traceability');
    }
    if (data.physicoChimique?.fileUrlAnalyse) {
        data.physicoChimique.fileUrlAnalyse = saveBase64(data.physicoChimique.fileUrlAnalyse, 'analysis');
    }
    if (data.organoleptique?.fileUrlPanelTest) {
        data.organoleptique.fileUrlPanelTest = saveBase64(data.organoleptique.fileUrlPanelTest, 'panel-tests');
    }
    if (data.purete?.fileUrlPurete) {
        data.purete.fileUrlPurete = saveBase64(data.purete.fileUrlPurete, 'purity');
    }
    if (data.securite?.fileUrlSecurite) {
        data.securite.fileUrlSecurite = saveBase64(data.securite.fileUrlSecurite, 'security');
    }
    // Ajout pour les documents d'export (objet dynamique)
    if (data.documentsExport) {
        Object.keys(data.documentsExport).forEach(key => {
            if (data.documentsExport[key] && data.documentsExport[key].startsWith('data:')) {
                data.documentsExport[key] = saveBase64(data.documentsExport[key], 'exports');
            }
        });
    }
    return data;
};

// ==========================================
// 1. CRÉER UN PRODUIT
// ==========================================
exports.addProduct = async (req, res) => {
    try {
        let data = processAllFiles({ ...req.body });

        const newProduct = new Product(data);
        const savedProduct = await newProduct.save();

        // 🔔 Notification Globale (Nouveau Lot)
        const notification = new Notification({
            recipient: null,
            type: "OFFRE_MATCH",
            title: "Nouveau lot disponible",
            message: `Un nouveau lot de ${data.physicoChimique?.variety || "Huile d'olive"} est en ligne.`,
            link: "/market",
            isRead: false
        });
        await notification.save();

        const io = req.app.get('socketio');
        if (io) io.to("buyers").emit('newNotification', notification);

        res.status(201).json(savedProduct);
    } catch (err) {
        console.error("Add Error:", err);
        res.status(400).json({ message: "Erreur lors de l'ajout", error: err.message });
    }
};

// ==========================================
// 2. MODIFIER UN PRODUIT
// ==========================================
exports.updateProduct = async (req, res) => {
    try {
        const oldProduct = await Product.findById(req.params.id);
        if (!oldProduct) return res.status(404).json({ message: "Produit non trouvé" });

        // Traitement des fichiers (ne traite que les nouveaux Base64)
        let updateData = processAllFiles({ ...req.body });

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        // 🔔 Notification si le statut change (ex: Validé par Admin)
        if (updateData.status && updateData.status !== oldProduct.status) {
            const statusNotif = new Notification({
                recipient: updatedProduct.sellerId,
                type: "STATUS_UPDATE",
                title: "Mise à jour du statut",
                message: `Votre lot ${updatedProduct.traceability?.lotNumber || ""} est désormais : ${updateData.status}`,
                link: "/inventory",
                isRead: false
            });
            await statusNotif.save();
            
            const io = req.app.get('socketio');
            if (io) io.to(updatedProduct.sellerId.toString()).emit('newNotification', statusNotif);
        }

        res.status(200).json(updatedProduct);
    } catch (err) {
        console.error("Update Error:", err);
        res.status(400).json({ message: "Erreur modification", error: err.message });
    }
};

// ==========================================
// 3. LIRE TOUS LES PRODUITS (AVEC FILTRES)
// ==========================================
exports.getAllProducts = async (req, res) => {
    try {
        const { variety, campaign, acidityMax, status, port, isVerified } = req.query;
        let query = {};

        if (variety) query["physicoChimique.variety"] = variety;
        if (campaign) query["traceability.campagneOleicole"] = campaign;
        if (acidityMax) query["physicoChimique.aciditeLibre"] = { $lte: Number(acidityMax) };
        if (status) query.status = status;
        if (port) query["logistique.port"] = port;
        if (isVerified) query["verification.isSellerVerified"] = isVerified === "true";

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

// ==========================================
// 4. LIRE PAR ID
// ==========================================
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Produit non trouvé" });
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: "Erreur récupération", error: err.message });
    }
};

// ==========================================
// 5. PRODUITS PAR VENDEUR
// ==========================================
exports.getProductsBySeller = async (req, res) => {
    try {
        const products = await Product.find({ sellerId: req.params.sellerId }).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

// ==========================================
// 6. SUPPRIMER
// ==========================================
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Produit non trouvé" });

        // Optionnel : Supprimer les fichiers physiques ici avec fs.unlinkSync si nécessaire
        
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Produit supprimé avec succès" });
    } catch (err) {
        res.status(500).json({ message: "Erreur suppression", error: err.message });
    }
};