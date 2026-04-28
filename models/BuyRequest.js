const mongoose = require("mongoose");

const buyRequestSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // --- 1. TRAÇABILITÉ & PRODUCTION ---
  traceability: {
    campagneOleicole: String, // ex: 2024/2025
    typeRecolte: { 
      type: String, 
      enum: ["Manuelle", "Récolte par gaule (bâtonnage)", "Filets au sol", "Mécanique (peignes)", "Vibreur de tronc", "Entièrement mécanisée", "Indifférent"] 
    },
    typeIrrigation: { 
      type: String, 
      enum: ["Sec", "Complémentaire", "Gravitaire", "Aspersion", "Goutte-à-goutte", "Enterrée", "Indifférent"] 
    },
    methodeExtraction: { 
      type: String, 
      enum: ["Traditionnelle", "Presse hydraulique", "3 phases", "2 phases", "À froid", "Assistée", "Indifférent"] 
    },
    filtration: { type: String, enum: ["Filtrée", "Non filtrée", "Indifférent"] },
    stabiliteRancimatMin: { type: String, enum: ["5 à 8 h", "8 à 15 h", "+15 h", "Indifférent"] },
    dureeConservationAttendue: { type: String, enum: ["2 à 6 mois", "12 à 18 mois", "18 à 24 mois", "24 mois", "Indifférent"] },
    stockageSouhaite: {
      temperature: { type: String, default: "14–18 °C" },
      recipients: [String], // ["Inox", "Verre foncé"]
    }
  },

  // --- 2. ANALYSES PHYSICO-CHIMIQUES (COI) ---
  physicoChimique: {
    variety: { type: String, required: true },
    classification: { type: String, required: true, enum: ["Vierge Extra", "Vierge", "Lampante"] },
    aciditeLibreMax: Number, // ex: 0.8
    indicePeroxydeMax: Number, // ex: 20
    absorbanceUV: {
      k232Max: Number,
      k270Max: Number,
      deltaKMax: Number,
    },
    humiditeMax: Number, // ≤ 0,2 %
    impuretesMax: Number, // ≤ 0,1 %
  },

  // --- 3. ANALYSE ORGANOLEPTIQUE (PANEL TEST) ---
  organoleptique: {
    medianeDefautsMax: { type: Number, default: 0 },
    medianeFruiteMin: Number,
    attributsPositifsSouhaites: [String], // ["Fruité vert intense", "Amer moyen", "Équilibrée"]
    attributsNegatifsRefuses: [String], // ["Rance", "Chômé", "Vineux"]
  },

  // --- 4. ANALYSES DE PURETÉ (ANTI-FRAUDE) ---
  purete: {
    acideOleiqueMin: Number, // 55–83 %
    acideLinoleiqueMax: Number, // 3,5–21 %
    acidePalmitiqueMax: Number, // 7,5–20 %
    sterolsTotauxMin: Number, // ≥ 1000 mg/kg
    betaSitosterolMin: Number, // ≥ 93 %
    alkylEstersMax: Number, // < 75 ou 150 mg/kg
    ethylEstersMax: Number, // ≤ 35 mg/kg
    pointFumeeMin: Number, // 190–210 °C
  },

  // --- 5. SÉCURITÉ ALIMENTAIRE & CONTAMINANTS ---
  securite: {
    pesticidesRequises: { type: Boolean, default: true },
    metauxLourds: { type: Boolean, default: true }, // Pb, Cd, As, Hg
    moshMoah: { type: Boolean, default: false },
    microbiologie: { type: Boolean, default: false }, // Levures, Salmonella
  },

  // --- 6. LOGISTIQUE, PACKAGING & PRIX ---
  logistique: {
    quantityNeeded: { type: Number, required: true },
    targetPrice: Number,
    packagingType: { type: String, enum: ["Bouteilles", "Semi Vrac", "Vrac"] },
    packagingDetail: String, // ex: "Bouteille Verre 750ml", "IBC conforme USA"
    incotermSouhaite: { type: String, enum: ["EXW", "FCA", "CPT", "CIP", "DAP", "DPU", "DDP", "FAS", "FOB", "CFR", "CIF"] },
    destinationPort: { type: String, enum: ["Radès", "La Goulette", "Bizerte", "Sousse", "Sfax", "Gabès", "Autre"] },
  },

  // --- 7. CERTIFICATIONS & RÉCOMPENSES ---
  certificationsRequises: [String], // ["ISO 22000", "HACCP", "BIO Europe", "USDA Organic", "Halal", "AOP"]
  recompensesSouhaitees: [String], // ["Mario Solinas", "NYIOOC Gold", "Concours ONH Or"]

  status: {
    type: String,
    enum: ["En attente de validation", "Validé", "Rejeté", "Ouvert", "Clôturé"],
    default: "En attente de validation",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BuyRequest", buyRequestSchema);