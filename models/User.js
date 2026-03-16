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
  companyName: String,

  // SELLER DATA
  seller: {
    registrationNumber: String,
    rneFile: String,
    region: String,
    delegation: String,
    producerName: String,
    millName: String,
    capacity: Number,
    altitude: String
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
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    console.log(err);
  }
});

// --- METHOD: Compare password for login ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);