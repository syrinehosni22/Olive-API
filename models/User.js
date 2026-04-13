const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["vendeur", "acheteur", "prestataire"],
    required: true
  },
  planId: {
    type: String,
    required: true
  },

  // AUTHENTICATION
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },

  // COMMON DATA
  firstName: String,
  name: String,
  phone: String,
  companyName: {
    type: String,
    trim: true
  },
  registrationNumber: { 
    type: String,
    trim: true
  },

  // SELLER DATA
  seller: {
    region: {
      type: String,
      enum: ["Nord-ouest", "Centre", "Sud", "Sahel", "Cap Bon"]
    },
    delegation: String,
    producerName: String,
    millName: String,
    capacity: {
      type: Number,
      default: 0
    },
    altitude: Number,
    rneFile: String 
  },

  // BUYER DATA
  buyer: {
    buyerType: String,
    searchRegion: String,
    searchCapacity: String
  },

  // SERVICE PROVIDER DATA
  provider: {
    proEmail: String,
    website: String,
    serviceType: String,
    instagram: String,
    facebook: String,
    linkedin: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// --- MIDDLEWARE: Hachage du mot de passe avant sauvegarde ---
userSchema.pre("save", async function (next) {
  // On ne hache que si le mot de passe est nouveau ou modifié
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    console.log(err);
  }
});

// --- MÉTHODE: Comparer le mot de passe pour le login ---
// Cette méthode est attachée à chaque instance de "User"
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// IMPORTANT: Toujours exporter le modèle APRÈS avoir défini les méthodes et middlewares
module.exports = mongoose.model("User", userSchema);