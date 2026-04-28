const User = require("../models/User");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// Utilitaire pour sauvegarder une image/fichier Base64
const saveBase64File = (base64String, subFolder) => {
  if (!base64String || !base64String.startsWith("data:")) return null;

  // Extraire l'extension et les données
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return null;

  const extension = matches[1].split("/")[1]; // ex: pdf, png, jpg
  const data = Buffer.from(matches[2], "base64");
  
  const fileName = `${subFolder}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
  const uploadDir = path.join(__dirname, "../uploads/", subFolder);

  // Créer le dossier s'il n'existe pas
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, data);

  // Retourner le chemin relatif pour la base de données
  return `/uploads/${subFolder}/${fileName}`;
};

// --- 1. REGISTER WITH PAYMENT ---
exports.registerWithPayment = async (req, res) => {
  try {
    const body = req.body;
        console.log("body",body)

    const { role } = body;
    let roleData = {};

    if (role === "vendeur") {
      // Sauvegarde du fichier RNE s'il est envoyé en Base64
      const rnePath = saveBase64File(body.rneFile, "rne_docs");
      
      roleData.seller = {
        rneFile: rnePath, // Stocke l'URL relative (/uploads/rne_docs/file.pdf)
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
      registrationNumber: body.registrationNumber,
      ...roleData,
    });

    await user.save();
    
    // Simuler un lien de paiement
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

    const userObject = user.toObject();
    delete userObject.password;
    userObject.id = userObject._id; 

    res.json({
      success: true,
      user: userObject 
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// --- 3. GET ME ---
exports.getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_fallback_secret_key");
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// --- 4. LOGOUT ---
exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  res.json({ success: true, message: "Logged out" });
};