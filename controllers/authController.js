const User = require("../models/User");
const bcrypt = require("bcryptjs"); // Ensure you have bcryptjs installed
const jwt = require("jsonwebtoken"); // Ensure you have jsonwebtoken installed

exports.registerWithPayment = async (req, res) => {

  try {

    const body = req.body;

    const role = body.role;

    let roleData = {};

    if (role === "vendeur") {

      roleData.seller = {
        registrationNumber: body.registrationNumber,
        rneFile: req.file ? req.file.filename : null,
        region: body.region,
        delegation: body.delegation,
        producerName: body.producerName,
        millName: body.millName,
        capacity: body.capacity,
        altitude: body.altitude
      };

    }

    if (role === "acheteur") {

      roleData.buyer = {
        buyerType: body.buyerType,
        searchRegion: body.searchRegion,
        searchCapacity: body.searchCapacity
      };

    }

    if (role === "prestataire") {

      roleData.provider = {
        proEmail: body.proEmail,
        website: body.website,
        serviceType: body.serviceType,
        instagram: body.instagram,
        facebook: body.facebook,
        linkedin: body.linkedin
      };

    }

    const user = new User({

      role: body.role,
      planId: body.planId,
      firstName: body.firstName,
      name: body.name,
      email: body.email,
      password:body.password,
      phone: body.phone,
      companyName: body.companyName,

      ...roleData

    });

    await user.save();

    const paymentUrl = `https://payment-platform.com/pay/${user._id}`;

    res.json({
      success: true,
      paymentUrl
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Registration failed"
    });

  }

};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 2. Compare passwords
    // Note: This assumes you hashed the password during registration
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Create JWT Token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "your_fallback_secret_key", 
      { expiresIn: "24h" }
    );

    // 4. Send response
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        name: user.name,
        role: user.role,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};