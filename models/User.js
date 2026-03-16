const mongoose = require("mongoose");

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

  // COMMON DATA
  firstName: String,
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: String,

  // COMPANY
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

module.exports = mongoose.model("User", userSchema);