const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =========================
    // 1. TRAÇABILITÉ & RÉCOLTE
    // =========================
    traceability: {
      campagneOleicole: { type: String, required: true }, // ex: 2024/2025
      lotNumber: { type: String, required: true, unique: true },
      dateRecolte: Date,
      dateExtraction: Date,
      typeRecolte: {
        type: String,
        enum: [
          "Manuelle",
          "Récolte par gaule (bâtonnage)", // <-- Doit être identique au frontend
          "Récolte avec filets au sol",
          "Récolte mécanique avec peignes",
          "Récolte mécanique par vibreur",
          "Récolte entièrement mécanisée",
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
      filtration: { type: String, enum: ["Filtrée", "Non filtrée"] },
      stabiliteRancimat: {
        type: String,
        enum: ["5 à 8 h", "8 à 15 h", "+15 h"],
      },
      dureeConservation: {
        type: String,
        enum: ["2 à 6 mois", "12 à 18 mois", "18 à 24 mois", "24 mois"],
      },
      stockage: {
        temperature: { type: String, default: "14-18 °C" },
        recipients: { type: String, enum: ["Inox", "Verre foncé"] },
        conditions: [String], // ["Abri de la lumière"]
      },
    },

    // =========================
    // 2. ANALYSES PHYSICO-CHIMIQUES
    // =========================
    physicoChimique: {
      variety: {
        type: String,
        enum: [
          "Chemlali",
          "Chetoui",
          "Oueslati",
          "Zarrazi",
          "Chemchali",
          "Koroneiki",
          "Sayali",
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
        enum: ["Vierge Extra", "Vierge", "Lampante"],
      },
      aciditeLibre: Number, // % acide oléique
      indicePeroxyde: Number, // meq O2/kg
      absorbanceUV: {
        k232: Number,
        k270: Number,
        deltaK: Number,
      },
      humiditeMatieresVolatiles: Number,
      impuretesInsolubles: Number,
      fileUrlAnalyse: String, // Bulletin d'analyse obligatoire
    },

    // =========================
    // 3. ORGANOLEPTIQUE (Panel Test COI)
    // =========================
    organoleptique: {
      medianeDefauts: { type: Number, default: 0 },
      medianeFruite: Number,
      attributsNegatifs: [String], // ["Rance", "Chômé", etc.]
      attributsPositifs: [String], // ["Fruité vert", "Amer intense", "Équilibrée"]
      fileUrlPanelTest: String,
    },

    // =========================
    // 4. PURETÉ (Anti-Fraude)
    // =========================
    purete: {
      acidesGras: {
        oleique: Number, // 55-83%
        linoleique: Number,
        palmitique: Number,
      },
      sterols: {
        totaux: Number, // >= 1000 mg/kg
        betaSitosterol: Number, // >= 93%
      },
      erythrodiolUvaol: Number,
      ciresWaxes: Number,
      alkylEsters: Number,
      ethylEstersFAEE: Number,
      pointFumee: Number,
      fileUrlPurete: String,
    },

    // =========================
    // 5. SÉCURITÉ & CONTAMINANTS
    // =========================
    securite: {
      pesticides: { type: Boolean, default: false },
      metauxLourds: { type: Boolean, default: false },
      moshMoah: { type: Boolean, default: false },
      microbiologie: {
        levuresMoisissures: String,
        salmonella: String,
      },
      fileUrlSecurite: String,
    },

    // =========================
    // 6. LOGISTIQUE & COMMERCE
    // =========================
    logistique: {
      packagingType: {
        type: String,
        enum: ["Bouteilles", "Semi Vrac", "Vrac"],
      },
      packagingDetail: String, // ex: "Bouteille Verre 750ml"
      totalQuantity: { type: Number, required: true },
      moq: { type: Number, default: 0 },
      price: { type: Number, required: true },
      incoterm: {
        type: String,
        enum: [
          "EXW",
          "FCA",
          "CPT",
          "CIP",
          "DAP",
          "DPU",
          "DDP",
          "FAS",
          "FOB",
          "CFR",
          "CIF",
        ],
      },
      port: {
        type: String,
        enum: ["Radès", "La Goulette", "Bizerte", "Sousse", "Sfax", "Gabès"],
      },
      photos: [String],
    },

    // =========================
    // 7. DOCUMENTS EXPORT & CERTIFS
    // =========================
    documentsExport: {
      certificatOrigine: String,
      certificatBio: String,
      certificatSanitaire: String,
      certificatPhytosanitaire: String,
      coa: String,
      ficheTechnique: String,
    },
    certifications: [String], // ["ISO 22000", "HACCP", "Halal", "AOP"]
    recompenses: [
      {
        concours: String,
        prix: String,
        annee: String,
      },
    ],

    status: {
      type: String,
      enum: ["En attente de validation", "Validé", "Disponible", "Rejeté"],
      default: "En attente de validation",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
