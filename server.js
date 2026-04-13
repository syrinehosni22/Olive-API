const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const http = require("http"); // Requis pour Socket.io
const { Server } = require("socket.io"); // Requis pour Socket.io
const mongoose = require("mongoose");

// Import des modèles
const Message = require("./models/message"); 
const Notification = require("./models/Notification");
// Utilisation de mongoose.models pour éviter l'erreur OverwriteModelError
const User = mongoose.models.User || require("./models/User"); 

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/messages");
const buyRequestRoutes = require("./routes/buyRequest");
const notificationRoutes = require("./routes/notificationRoutes"); 

const app = express();

// --- SOCKET.IO INTEGRATION ---
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
    credentials: true
  }
});

// --- RENDRE IO ACCESSIBLE DANS LES CONTROLEURS ---
app.set('socketio', io);

// Connect to Database
connectDB();

// --- MIDDLEWARES ---
app.use(cookieParser()); 

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true 
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- ROUTES ---
app.use("/api/auth", authRoutes); 
app.use("/api/user", userRoutes);
app.use('/api/products', require('./routes/products'));
app.use('/api/messages', messageRoutes);
app.use("/api/buy-requests", buyRequestRoutes);
app.use("/api/notifications", notificationRoutes); 

// --- SOCKET.IO LOGIC ---
let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Gérer la mise en ligne d'un utilisateur
  socket.on("addUser", async (data) => {
    let userId;
    let role;

    // --- LOGIQUE DE RÉCUPÉRATION DU RÔLE ---
    // Si data est juste un string (ID), on va chercher le rôle en base de données
    if (typeof data === 'string') {
      userId = data;
      try {
        const user = await User.findById(userId);
        role = user ? user.role : null;
      } catch (err) {
        console.error("Erreur récupération rôle socket:", err);
      }
    } else {
      // Si data est un objet {userId, role}
      userId = data.userId;
      role = data.role || null;
    }

    if (!userId) return;

    // Mise à jour de la liste des utilisateurs en ligne
    if (!onlineUsers.some((u) => u.userId === userId)) {
      onlineUsers.push({ userId, socketId: socket.id, role });
    }

    // 1. Rejoindre la room personnelle (ID de l'utilisateur) pour les messages privés
    socket.join(userId);
    console.log(`User ${userId} joined personal room`);

    // 2. Rejoindre la room collective des acheteurs
    if (role === 'acheteur') {
      socket.join("buyers");
      console.log(`User ${userId} joined the BUYERS room`);
    }

    // 3. Rejoindre la room collective des vendeurs
    if (role === 'vendeur') {
      socket.join("sellers");
      console.log(`User ${userId} joined the SELLERS room`);
    }
    
    io.emit("getOnlineUsers", onlineUsers);
  });

  // Gérer l'envoi de message en temps réel
  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    try {
      const newMessage = new Message({
        senderId,
        receiverId,
        text
      });
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
      console.error("Erreur lors de la sauvegarde du message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});