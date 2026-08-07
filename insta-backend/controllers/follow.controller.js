const { User } = require("../models/user.model");
const { Notification } = require("../models/notification.model");

const { sendNotification } = require("../utilities/sendNotification");

const toggleFollow = async (req, res) => {
  const currentUserId = req.user._id;
  const { userId } = req.params;

  try {
    if (currentUserId.toString() === userId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const alreadyFollowing = currentUser.following.some(
      (id) => id.toString() === userId,
    );

    if (alreadyFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== userId,
      );

      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId.toString(),
      );
    } else {
      currentUser.following.push(targetUser._id);

      targetUser.followers.push(currentUser._id);

      // CREATE FOLLOW NOTIFICATION

      await Notification.create({
        recipient: targetUser._id,

        sender: currentUserId,

        type: "follow",
      });

      sendNotification(targetUser._id.toString(), {
        type: "follow",
        sender: {
          username: currentUser.username,
          profilePicture: currentUser.profilePicture,
        },
      });
    }

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({
      following: !alreadyFollowing,
      followers: targetUser.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  toggleFollow,
};
