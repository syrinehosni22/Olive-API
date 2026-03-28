const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // --- IDENTIFICATION ---
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // --- CARACTÉRISTIQUES DE L'HUILE (Attributs d'origine) ---
  variety: {
    type: String,
    enum: ['Chemlali', 'Chetoui', 'Oueslati'],
    required: true,
    default: 'Chemlali'
  },
  classification: {
    type: String,
    enum: ['Vierge Extra', 'Vierge'],
    required: true,
    default: 'Vierge Extra'
  },
  acidity: {
    type: Number,
    default: 0 // Correspond à formData.acidity || "0"
  },

  // --- LOGISTIQUE & PRIX (Attributs d'origine) ---
  totalQuantity: {
    type: Number,
    required: true // Volume total en Litres
  },
  minOrderQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: true // Prix au Litre (€/L)
  },

  // --- PACKAGING (Nouveaux attributs consolidés) ---
  packagingType: {
    type: String,
    enum: ['Bouteilles', 'Semi Vrac', 'Vrac'],
    required: true
  },
  packagingDetail: {
    type: String,
    required: true 
  },

  // --- MÉDIAS : PHOTOS ---
  // Note : Dans le front, elles sont masquées si packagingType === 'Vrac'
  photos: [{
    type: String // Stocke les URLs/chemins des images du packaging
  }],

  // --- DOCUMENTS TECHNIQUES (Les 5 nouveaux champs) ---
  certificatOrigine: { type: String, default: null },
  certificatBio: { type: String, default: null },
  ficheTechnique: { type: String, default: null },
  ficheSecurite: { type: String, default: null },
  certificatSanitaire: { type: String, default: null },

  // --- MÉTADONNÉES ---
  status: {
    type: String,
    enum: ['Disponible', 'Vendu', 'En attente de validation'],
    default: 'Disponible'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);