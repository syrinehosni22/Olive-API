const Message = require("../models/message");
const User = require("../models/User");

// Historique entre deux utilisateurs
exports.getChatHistory = async (req, res) => {
  try {
    const { userId, contactId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du chat." });
  }
};

// Liste des contacts (Conversations récentes)
exports.getUserContacts = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 });

    const contactMap = new Map();
    messages.forEach(m => {
      const otherId = m.senderId.toString() === userId ? m.receiverId.toString() : m.senderId.toString();
      if (!contactMap.has(otherId)) {
        contactMap.set(otherId, { lastMessage: m.text, updatedAt: m.createdAt });
      }
    });

    const contactIds = Array.from(contactMap.keys());
    const users = await User.find({ _id: { $in: contactIds } }, "name email role");

    const formatted = users.map(u => ({
      id: u._id,
      name: u.name,
      lastMessage: contactMap.get(u._id.toString()).lastMessage,
      updatedAt: contactMap.get(u._id.toString()).updatedAt,
      isOnline: false
    })).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.status(200).json(formatted);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erreur conversations." });
  }
};