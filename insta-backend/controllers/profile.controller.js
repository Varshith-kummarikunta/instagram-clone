const { User } = require("../models/user.model");
const { Post } = require("../models/post.model");

const getProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select("-passwordHash")
      .populate("followers", "username profilePicture")
      .populate("following", "username profilePicture");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const posts = await Post.find({
      author: user._id,
    }).sort({
      _id: -1,
    });

    res.json({
      user,
      posts,

      postCount: posts.length,

      followers: user.followers.length,

      following: user.following.length,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
};
