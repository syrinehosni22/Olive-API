const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const multer = require("multer"); // 1. Import Multer
const path = require("path");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const app = express();

connectDB();

// 2. Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generates a unique name: timestamp + original extension
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Static files
app.use("/uploads", express.static("uploads"));

// --- ROUTES ---

// If you want a route to handle FormData, you MUST add the middleware here
// Use upload.any() if you don't know the field names, 
// or upload.single('fieldname') for specific files.
app.use("/api/auth", upload.any(), authRoutes); 
app.use("/api/user", upload.any(), userRoutes);
app.use('/api/products', upload.any(), require('./routes/products'));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});