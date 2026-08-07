const { User } = require("../models/user.model");

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const users = await User.find({
      username: {
        $regex: q,
        $options: "i",
      },
    })
      .select("username name profilePicture")
      .limit(10);

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  searchUsers,
};
