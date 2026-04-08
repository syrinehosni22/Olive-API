const User = require("../models/User");

// @desc    Get user profile by ID
// @route   GET /api/users/profile/:id
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: Validate if 'id' is a valid hex string to avoid CastError
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Format d'ID invalide" });
    }

    // Find user by ID from params and exclude password
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération", 
      error: error.message 
    });
  }
};

// @desc    Update user profile
// @route   PATCH /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.body.user.id;
    const updates = req.body.user;

    // Security: Prevent users from changing their own role or email via this route
    // if you want to keep those immutable after registration
    delete updates.password; 
    delete updates.role;
    delete updates.email;

    // Use { new: true, runValidators: true } to get the updated document back
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error.message)
    res.status(400).json({ message: "Erreur lors de la mise à jour", error: error.message });
  }
};