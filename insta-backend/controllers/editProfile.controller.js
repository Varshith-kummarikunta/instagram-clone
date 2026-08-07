const { User } = require("../models/user.model");

const updateProfile = async (req, res) => {
  try {
    const { name, bio, profilePicture } = req.body;

    const updates = {};

    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (profilePicture !== undefined) {
      updates.profilePicture = profilePicture;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).select("-passwordHash");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  updateProfile,
};