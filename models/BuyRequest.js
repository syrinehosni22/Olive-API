const mongoose = require("mongoose");

const buyRequestSchema = new mongoose.Schema({
  // --- IDENTIFICATION ---
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // --- 1. TRAÇABILITÉ SOUHAITÉE ---
  traceability: {
    campagneOleicole: { type: String }, 
    typeRecolte: { type: String },
    typeIrrigation: { type: String },
    methodeExtraction: { type: String },
    stockageSuhaité: [String],
  },

  // --- 2. CRITÈRES PHYSICO-CHIMIQUES RECHERCHÉS ---
  physicoChimique: {
    variety: {
      type: String,
      required: true, // L'acheteur sait généralement quelle variété il veut
      enum: [
        "Chemlali", "Chetoui", "Oueslati", "Zarrazi", "Chemchali",
        "Koroneiki", "Sayali / Tounsi", "Frantoio", "Leccino",
        "Coratina", "Arbequina", "Arbosana", "Picual", "Picholine", "Aglandau"
      ],
    },
    classification: {
      type: String,
      required: true,
      enum: ["Vierge Extra", "Vierge", "Lampante"],
    },
    aciditeLibreMax: Number, // L'acheteur fixe une limite haute
    indicePeroxydeMax: Number,
  },

  // --- 3. PRÉFÉRENCES ORGANOLEPTIQUES ---
  organoleptique: {
    fruiteMin: Number,
    attributsPositifsSouhaites: [String], // Ex: ["Fruité vert", "Piquant léger"]
  },

  // --- 4. EXIGENCES DE SÉCURITÉ ---
  securite: {
    pesticidesFree: { type: Boolean, default: false },
    sansMetauxLourds: { type: Boolean, default: false },
  },

  // --- 5. LOGISTIQUE & BUDGET (CRUCIAL) ---
  logistique: {
    quantityNeeded: { type: Number, required: true },
    targetPrice: { type: Number }, // Prix cible de l'acheteur
    packagingType: {
      type: String,
      enum: ["Bouteilles", "Semi Vrac", "Vrac", "Bouteilles Verre/PET", "Vrac (Citerne)", "Semi Vrac (IBC)"],
      required: true,
    },
    incotermSouhaite: { type: String, enum: ["EXW", "FOB", "CIF", "DAP"] },
    destinationPort: String,
  },

  // --- 6. GESTION DE L'OFFRE ---
  status: {
    type: String,
    enum: [
      "En attente de validation", 
      "Validé", 
      "Rejeté", 
      "Ouvert", 
      "En négociation", 
      "Clôturé", 
      "Annulé"
    ],
    default: "En attente de validation",
  },

  // --- 7. VALIDATION ADMINISTRATIVE (AJOUTÉ) ---
  validationDetails: {
    isValidated: { type: Boolean, default: false },
    validatedAt: Date,
    validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectionReason: String, // Motif en cas de rejet pour informer l'acheteur
  },

  expiresAt: { 
    type: Date, 
    default: () => new Date(+new Date() + 30*24*60*60*1000) // Expire par défaut dans 30 jours
  },
  createdAt: { type: Date, default: Date.now },
});

// --- MÉTHODES STATIQUES POUR LE MATCHING ---

// Trouver des produits qui correspondent à cette demande d'achat
buyRequestSchema.methods.findMatchingProducts = function() {
  return mongoose.model("Product").find({
    "physicoChimique.variety": this.physicoChimique.variety,
    "physicoChimique.classification": this.physicoChimique.classification,
    "physicoChimique.aciditeLibre": { $lte: this.physicoChimique.aciditeLibreMax || 10 },
    "logistique.packagingType": this.logistique.packagingType,
    "logistique.totalQuantity": { $gte: this.logistique.quantityNeeded },
    status: "Validé" // On ne propose que des produits déjà validés par l'admin
  });
};

module.exports = mongoose.model("BuyRequest", buyRequestSchema);