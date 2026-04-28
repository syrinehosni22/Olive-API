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
      campagneOleicole: { type: String, required: true },
      lotNumber: { type: String, required: true, unique: true },
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
          "Récolte entièrement mécanisée (oliveraies intensives)",
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
        recipients: {
          type: String,
          enum: [
            "Récipients en Inox",
            "Récipients en Verre foncé",
            "Citernes souples",
            "IBC",
          ],
        },
        conditions: [String],
      },
      fileUrlTraceabilite: { type: String }, // Stocke l'URL du fichier
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
        enum: ["Vierge Extra", "Vierge", "Lampante"],
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
      fileUrlAnalyse: { type: String }, // Stocke l'URL du bulletin
    },

    // =========================
    // 3. ORGANOLEPTIQUE (Panel Test COI)
    // =========================
    organoleptique: {
      medianeDefauts: { type: Number, default: 0 },
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
          ],
        },
      ],
      fileUrlPanelTest: { type: String }, // Stocke l'URL
    },

    // =========================
    // 4. PURETÉ & QUALITÉ COMMERCIALE
    // =========================
    purete: {
      acidesGras: {
        oleique: Number,
        linoleique: Number,
        palmitique: Number,
      },
      sterols: {
        totaux: Number,
        betaSitosterol: Number,
      },
      erythrodiolUvaol: Number,
      ciresWaxes: Number,
      alkylEsters: Number,
      ethylEstersFAEE: Number,
      pointFumee: Number,
      polyphenolsTotaux: { type: String }, // Changé de Number à String
      tocopherols: { type: String },
      fileUrlPurete: { type: String }, // Stocke l'URL
    },

    // =========================
    // 5. SÉCURITÉ & CONTAMINANTS
    // =========================
    securite: {
      pesticides: { type: Boolean, default: false },
      metauxLourds: [String],
      contaminants: [String],
      microbiologie: {
        levuresMoisissures: String,
        salmonella: String,
        eColi: String,
      },
      fileUrlSecurite: { type: String }, // Stocke l'URL
    },

    // =========================
    // 6. LOGISTIQUE & COMMERCE
    // =========================
    logistique: {
      packagingType: {
        type: String,
        enum: ["Bouteilles", "Semi Vrac", "Vrac"],
      },
      packagingDetail: { type: String },
      totalQuantity: { type: Number, required: true },
      moq: { type: Number, default: 0 },
      price: { type: Number, required: true },
      currency: { type: String, default: "EUR" },
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
      photosProduit: [String], // Tableau d'URLs d'images
    },

    // =========================
    // 7. CERTIFICATIONS & RÉCOMPENSES
    // =========================
    certifications: [String],

    recompenses: [
      {
        concours: String,
        prix: String,
        categorie: String,
        annee: String,
      },
    ],

    // =========================
    // 8. DOCUMENTS EXPORT
    // =========================
    documentsExport: {
      certificatOrigine: String, // Stocke l'URL
      certificatBio: String,
      certificatSanitaire: String,
      certificatPhytosanitaire: String,
      coa: String,
      ficheTechnique: String,
      ficheSecurite: String,
      analyseMigrationEmballage: String,
    },

    // =========================
    // 9. SYSTÈME DE CONFIANCE
    // =========================
    verification: {
      isSellerVerified: { type: Boolean, default: false },
      isAnalysisValidated: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["En attente de validation", "Validé", "Disponible", "Rejeté"],
      default: "En attente de validation",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
