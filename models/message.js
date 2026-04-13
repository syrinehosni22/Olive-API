const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Identifiant de l'expéditeur (Producteur, Expert ou Client)
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Identifiant du destinataire
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Contenu du message
  text: {
    type: String,
    required: true,
    trim: true
  },

  // État de lecture (utile pour les notifications)
  read: {
    type: Boolean,
    default: false
  },

  // Date de création (pour le tri chronologique dans Messenger)
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexation pour accélérer la récupération de l'historique entre deux personnes
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);