const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==============================
// 📁 Création dossiers auto
// ==============================
const createFolder = (folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
};

createFolder("uploads/images");
createFolder("uploads/documents");

// ==============================
// 📦 STORAGE CONFIG
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "images") {
      cb(null, "uploads/images");
    } else {
      cb(null, "uploads/documents");
    }
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  },
});

// ==============================
// 🛡 FILE FILTER
// ==============================
const fileFilter = (req, file, cb) => {
  // Images autorisées
  const imageTypes = /jpeg|jpg|png|webp/;

  // Documents autorisés
  const docTypes = /pdf/;

  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "images") {
    if (imageTypes.test(ext)) return cb(null, true);
    return cb(new Error("Images فقط jpg, png, webp"));
  }

  if (
    [
      "coa",
      "certificatOrigine",
      "certificatSanitaire",
      "certificatPhytosanitaire",
      "analyseEmballage",
    ].includes(file.fieldname)
  ) {
    if (docTypes.test(ext)) return cb(null, true);
    return cb(new Error("Documents doivent être PDF"));
  }

  cb(new Error("Type de fichier non autorisé"));
};

// ==============================
// ⚙️ CONFIG MULTER
// ==============================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// ==============================
// 📤 FIELDS (IMPORTANT)
// ==============================
const uploadFields = upload.fields([
  { name: "images", maxCount: 10 },

  { name: "coa", maxCount: 1 },
  { name: "certificatOrigine", maxCount: 1 },
  { name: "certificatSanitaire", maxCount: 1 },
  { name: "certificatPhytosanitaire", maxCount: 1 },
  { name: "analyseEmballage", maxCount: 1 },
]);

// ==============================
// 🚨 ERROR HANDLER
// ==============================
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: "Erreur upload",
      error: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      message: "Fichier invalide",
      error: err.message,
    });
  }
  next();
};

module.exports = {
  uploadFields,
  multerErrorHandler,
};