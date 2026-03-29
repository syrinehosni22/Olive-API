const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// --- 1. REGISTER WITH PAYMENT ---
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
    } else if (role === "acheteur") {
      roleData.buyer = {
        buyerType: body.buyerType,
        searchRegion: body.searchRegion,
        searchCapacity: body.searchCapacity
      };
    } else if (role === "prestataire") {
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
      password: body.password, 
      phone: body.phone,
      companyName: body.companyName,
      ...roleData
    });

    await user.save();
    const paymentUrl = `https://payment-platform.com/pay/${user._id}`;

    res.json({ success: true, paymentUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// --- 2. LOGIN (Sets HttpOnly Cookie) ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "your_fallback_secret_key", 
      { expiresIn: "24h" }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
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

// --- 3. GET ME (Persistence Check) ---
exports.getMe = async (req, res) => {
  try {
    const token = req.cookies.token; 
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_fallback_secret_key");
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Send the user data back to Redux
    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        name: user.name,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// --- 4. LOGOUT ---
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: "Logged out" });
};