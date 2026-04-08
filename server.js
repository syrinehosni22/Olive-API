const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser"); // 1. Import cookie-parser

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const app = express();

// Connect to Database
connectDB();

// --- MIDDLEWARES ---

// 2. Cookie Parser (CRITICAL for HttpOnly Cookies)
app.use(cookieParser()); 

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    credentials: true // Required to allow cookies
  })
);

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- ROUTES ---

// Note: Multer (upload.any()) should ideally be used inside specific routes 
// (like register) instead of globally here, but keeping it for your current flow:
app.use("/api/auth", authRoutes); 
app.use("/api/user", userRoutes);
app.use('/api/products', require('./routes/products'));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});