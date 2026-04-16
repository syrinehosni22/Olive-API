const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

// --- IMPORT DES MODÈLES ---
const Message = require("./models/message"); 
const Notification = require("./models/Notification");
const User = mongoose.models.User || require("./models/User"); 

// --- IMPORT DES ROUTES ---
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/products");
const messageRoutes = require("./routes/messages");
const buyRequestRoutes = require("./routes/buyRequest");
const notificationRoutes = require("./routes/notificationRoutes"); 

const app = express();

// --- CONFIGURATION SOCKET.IO ---
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Rendre io accessible dans les contrôleurs (req.app.get('socketio'))
app.set('socketio', io);

// Connexion à la base de données
connectDB();

// --- MIDDLEWARES ---
app.use(cookieParser()); 
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true 
}));

/** * CRITIQUE : Augmentation de la limite de taille pour le Base64 
 * Autorise jusqu'à 50 Mo pour que les fichiers PDF/Images ne soient pas rejetés (Error 413)
 */
app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded({ limit: "1000mb", extended: true }));

// Rendre le dossier uploads public pour l'affichage des images/fichiers
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- ROUTES ---
app.use("/api/auth", authRoutes); 
app.use("/api/user", userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/messages', messageRoutes);
app.use("/api/buy-requests", buyRequestRoutes);
app.use("/api/notifications", notificationRoutes); 

// --- LOGIQUE SOCKET.IO ---
let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("addUser", async (data) => {
    let userId;
    let role;

    if (typeof data === 'string') {
      userId = data;
      try {
        const user = await User.findById(userId);
        role = user ? user.role : null;
      } catch (err) {
        console.error("Erreur récupération rôle socket:", err);
      }
    } else {
      userId = data.userId;
      role = data.role || null;
    }

    if (!userId) return;

    if (!onlineUsers.some((u) => u.userId === userId)) {
      onlineUsers.push({ userId, socketId: socket.id, role });
    }

    // Rooms collectives et personnelles
    socket.join(userId);
    if (role === 'acheteur') socket.join("buyers");
    if (role === 'vendeur') socket.join("sellers");
    
    io.emit("getOnlineUsers", onlineUsers);
  });

  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    try {
      const newMessage = new Message({ senderId, receiverId, text });
      const savedMessage = await newMessage.save();

      const user = onlineUsers.find((u) => u.userId === receiverId);
      if (user) {
        io.to(user.socketId).emit("getMessage", {
          _id: savedMessage._id,
          senderId,
          text,
          createdAt: savedMessage.createdAt 
        });
      }
    } catch (error) {
      console.error("Erreur socket sendMessage:", error);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
});

// --- DÉMARRAGE DU SERVEUR ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Files limit set to 50MB for Base64 support`);
});