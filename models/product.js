const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  // --- IDENTIFICATION ---
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // --- 1. TRAÇABILITÉ & MÉTHODE D'EXTRACTION ---
  traceability: {
    campagneOleicole: { type: String, required: true },
    lotNumber: { type: String, required: true },
    dateRecolte: Date,
    dateExtraction: Date,
    typeRecolte: {
      type: String,
      enum: [
        "Manuelle",
        "Récolte par gaule (bâtonnage)",
        "Récolte avec filets au sol",
        "Récolte mécanique avec peignes ou vibreurs portatifs",
        "Récolte mécanique par vibreur de tronc",
        "Récolte entièrement mécanisée",
        "Gaule",
        "Mécanique (peignes)"
      ],
    },
    typeIrrigation: {
      type: String,
      enum: [
        "Sec",
        "Complémentaire",
        "Gravitaire",
        "Aspersion",
        "Goutte-à-goutte",
        "Enterrée",
      ],
    },
    methodeExtraction: {
      type: String,
      enum: [
        "Traditionnelle",
        "Presse hydraulique",
        "3 phases",
        "2 phases",
        "À froid",
        "Assistée",
      ],
    },
    stabiliteRancimat: {
      type: String,
      enum: [
        "5 à 8 h",
        "8 à 15 h",
        "+15 h",
        "5 à 8 h : stabilité moyenne",
        "8 à 15 h : bonne stabilité",
        "+15 h : excellente stabilité",
      ],
    },
    dureeConservation: {
      type: String,
      enum: ["2 à 6 mois", "12 à 18 mois", "18 à 24 mois", "24 mois"],
    },
    stockage: [
      {
        type: String,
        enum: [
          "Température : 14–18 °C",
          "À l’abri de la lumière",
          "Récipients en Inox",
          "Récipients en Verre foncé",
          "Récipients Inox",
          "Verre foncé",
          "14-18 °C / Abri lumière"
        ],
      },
    ],
    fileUrlTraceabilite: String,
  },

  // --- 2. ANALYSES PHYSICO-CHIMIQUES OBLIGATOIRES ---
  physicoChimique: {
    variety: {
      type: String,
      required: true,
      enum: [
        "Chemlali",
        "Chetoui",
        "Oueslati",
        "Zarrazi",
        "Chemchali",
        "Koroneiki",
        "Sayali / Tounsi",
        "Frantoio",
        "Leccino",
        "Coratina",
        "Arbequina",
        "Arbosana",
        "Picual",
        "Picholine",
        "Aglandau",
      ],
    },
    classification: {
      type: String,
      required: true,
      enum: [
        "Vierge Extra", 
        "Vierge", 
        "Lampante",
        "Vierge Extra (≤ 0,8%)",
        "Vierge (≤ 2,0%)",
        "Lampante (> 2,0%)"
      ],
    },
    aciditeLibre: Number,
    indicePeroxyde: Number,
    absorbanceUV: {
      k232: Number,
      k270: Number,
      deltaK: Number,
    },
    humiditeMatieresVolatiles: Number,
    impuretesInsolubles: Number,
    fileUrlAnalyse: String,
  },

  // --- 3. ANALYSE ORGANOLEPTIQUE (PANEL TEST) ---
  organoleptique: {
    medianeDefauts: Number,
    medianeFruite: Number,
    attributsNegatifs: [
      {
        type: String,
        enum: [
          "Chômé/lies",
          "Moisi-humidité-terre",
          "Vineux - Vinaigré - Acide – Aigre",
          "Olive gelée (Bois humide)",
          "Rance",
          "Métallique",
          "Foin sec",
          "Ver",
          "Grossier",
          "Saumure",
          "Cuit ou brûlé",
          "Margines Sparte",
          "Concombre",
          "Lubrifiants",
          "Rance",
          "Moisi-humidité"
        ],
      },
    ],
    attributsPositifs: [
      {
        type: String,
        enum: [
          "Fruité",
          "Fruité mûr",
          "Fruité vert",
          "Fruité léger",
          "Fruité moyen",
          "Fruité intense",
          "Fruité mûr léger",
          "Fruité mûr moyen",
          "Fruité mûr intense",
          "Fruité vert léger",
          "Fruité vert moyen",
          "Fruité vert intense",
          "Amer léger",
          "Amer moyen",
          "Amer intense",
          "Piquant léger",
          "Piquant moyen",
          "Piquant intense",
          "Huile équilibrée",
          "Huile douce",
          "Amer intense",
          "Piquant moyen"
        ],
      },
    ],
    fileUrlPanelTest: String,
  },

  // --- 4. ANALYSES DE PURETÉ (ANTI-FRAUDE) ---
  purete: {
    erythrodiolUvaol: { type: String }, // Accepte "< 3.5 %"
    ciresWaxes: { type: String },       // Accepte "≤ 250 mg/kg"
    alkylEsters: { type: String },      // Accepte "Qualité Supérieure (< 75 mg/kg)"
    ethylEstersFAEE: { type: String },  // Accepte "≤ 35 mg/kg"
    acideOleique: Number,
    acideLinoleique: Number,
    acidePalmitique: Number,
    sterolsTotaux: Number,
    betaSitosterol: Number,
    pointFumee: Number,
    fileUrlPurete: String,
  },

  // --- 5. CONTAMINANTS & MICROBIOLOGIE ---
  securite: {
    pesticides: { type: Boolean, default: false },
    metauxLourds: { type: Boolean, default: false },
    moshMoah: { type: Boolean, default: false },
    hapPah: { type: Boolean, default: false },
    plastifiantsPhtalates: { type: Boolean, default: false },
    microbiologie: {
      levuresMoisissures: String,
      salmonella: String,
      eColi: String,
    },
    fileUrlSecurite: String,
  },

  // --- 6. LOGISTIQUE & DOCUMENTS EXPORT ---
  logistique: {
    totalQuantity: { type: Number, required: true },
    price: { type: Number, required: true },
    packagingType: {
      type: String,
      enum: ["Bouteilles", "Semi Vrac", "Vrac", "Bouteilles Verre/PET", "Vrac (Citerne)", "Semi Vrac (IBC)"],
      required: true,
    },
    packagingDetail: String,
    certificatOrigine: String,
    certificatBio: String,
    ficheTechnique: String,
    ficheSecurite: String,
    certificatSanitaire: String,
    certificatPhytosanitaire: String,
    analyseConformiteEmballage: String,
  },

  certifications: [
    {
      type: String,
      enum: [
        "ISO 22000",
        "HACCP",
        "FSSC 22000",
        "BRCGS",
        "IFS Food",
        "EU Organic (BIO)",
        "USDA Organic",
        "Halal",
        "Kosher",
        "AOP / DOP",
        "IGP / PGI",
        "FDA Registration",
        "IFS FOOD"
      ],
    },
  ],
  status: {
    type: String,
    enum: [
      "Disponible", 
      "Vendu", 
      "En attente de validation", 
      "Validé", 
      "Rejeté"
    ],
    default: "En attente de validation",
  },
  // Détails de validation pour l'administration
  validationDetails: {
    isValidated: { type: Boolean, default: false },
    validatedAt: Date,
    validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectionReason: String, 
  },
  createdAt: { type: Date, default: Date.now },
});

// --- MÉTHODES STATIQUES ---

productSchema.statics.findBySeller = function (sellerId) {
  return this.find({ sellerId: sellerId }).sort({ createdAt: -1 });
};

// MISE À JOUR : Les méthodes de recherche ne retournent désormais que les produits "Validés" ou "Disponible"
productSchema.statics.findByVariety = function (variety) {
  return this.find({ 
    "physicoChimique.variety": variety, 
    status: { $in: ["Disponible", "Validé"] } 
  });
};

productSchema.statics.findByClassification = function (classification) {
  return this.find({ 
    "physicoChimique.classification": classification, 
    status: { $in: ["Disponible", "Validé"] } 
  });
};

productSchema.statics.findLowAcidity = function (threshold = 0.8) {
  return this.find({ 
    "physicoChimique.aciditeLibre": { $lte: threshold }, 
    status: { $in: ["Disponible", "Validé"] } 
  });
};

productSchema.statics.findPremiumQuality = function () {
  return this.find({
    "purete.alkylEsters": { $regex: /< 75/ },
    "physicoChimique.aciditeLibre": { $lte: 0.3 },
    status: { $in: ["Disponible", "Validé"] },
  });
};

productSchema.statics.advancedSearch = function (filters) {
  const query = { status: { $in: ["Disponible", "Validé"] } };
  if (filters.variety) query["physicoChimique.variety"] = filters.variety;
  if (filters.maxPrice) query["logistique.price"] = { $lte: filters.maxPrice };
  if (filters.minQuantity) query["logistique.totalQuantity"] = { $gte: filters.minQuantity };
  if (filters.classification) query["physicoChimique.classification"] = filters.classification;
  return this.find(query);
};

// --- MÉTHODES D'INSTANCE ---

productSchema.methods.isExpired = function () {
  return false;
};

productSchema.methods.updateStock = function (quantitySold) {
  this.logistique.totalQuantity -= quantitySold;
  if (this.logistique.totalQuantity <= 0) {
    this.status = "Vendu";
  }
  return this.save();
};

module.exports = mongoose.model("Product", productSchema);