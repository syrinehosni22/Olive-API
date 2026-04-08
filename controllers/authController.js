const User = require("../models/User");
const jwt = require("jsonwebtoken");

// --- 1. REGISTER WITH PAYMENT ---
exports.registerWithPayment = async (req, res) => {
  try {
    const body = req.body;
    const { role } = body;
    let roleData = {};

    // Map fields strictly according to the Mongoose Schema
    if (role === "vendeur") {
      roleData.seller = {
        rneFile: req.file ? req.file.filename : null,
        region: body.region,
        delegation: body.delegation,
        producerName: body.producerName,
        millName: body.millName,
        capacity: body.capacity,
        altitude: body.altitude,
      };
    } else if (role === "acheteur") {
      roleData.buyer = {
        buyerType: body.buyerType,
        searchRegion: body.searchRegion,
        searchCapacity: body.searchCapacity,
      };
    } else if (role === "prestataire") {
      roleData.provider = {
        proEmail: body.proEmail,
        website: body.website,
        serviceType: body.serviceType,
        instagram: body.instagram,
        facebook: body.facebook,
        linkedin: body.linkedin,
      };
    }

    const user = new User({
      role: body.role,
      planId: body.planId,
      firstName: body.firstName,
      name: body.name,
      email: body.email,
      password: body.password,
      phone: body.phone,
      companyName: body.companyName,
      registrationNumber: body.registrationNumber, // Corrected: Schema root level
      ...roleData,
    });

    await user.save();
    const paymentUrl = `https://payment-platform.com/pay/${user._id}`;

    res.json({ success: true, paymentUrl });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// --- 2. LOGIN ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user (Schema includes all fields by default)
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Email ou mot de passe invalide" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "your_fallback_secret_key",
      { expiresIn: "24h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/"
    });

    // Convert to object and cleanup
    const userObject = user.toObject();
    delete userObject.password;
    userObject.id = userObject._id; 

    res.json({
      success: true,
      user: userObject // Includes seller, buyer, or provider objects
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
};

// --- 3. GET ME (Persistence Check) ---
exports.getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_fallback_secret_key",
    );

    // FIX: select("-password") ensures ALL other fields (seller/buyer/provider) are returned
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// --- 4. LOGOUT ---
exports.logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};