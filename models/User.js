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

  // SELLER DATA (Synchronized with SellerData Interface)
  seller: {
    brandName: String,
    producerType: {
      type: String,
      enum: ["Producteur", "Collecteur", "Moulin", "Exportateur"],
    },
    region: String,
    delegation: String,
    millName: String,
    millType: {
      type: String,
      enum: ["Traditionnel", "Chaine Continue", "Super-Presse"],
    },
    capacity: {
      type: Number, // Match frontend type: number
      default: 0
    },
    altitude: Number, // Changed from String to Number to match frontend logic
    taxId: String,    // Added to match interface
    rneFile: String   // Kept from previous version for document storage
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

// --- MIDDLEWARE: Hash password before saving ---
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.getSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// --- METHOD: Compare password for login ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);