const { Story } = require("../models/story.model");
const { User } = require("../models/user.model");

// Upload Story
const createStory = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        message: "Image URL is required",
      });
    }

    const story = await Story.create({
      author: req.user._id,
      imageUrl,
    });

    const populatedStory = await Story.findById(story._id).populate(
      "author",
      "username name profilePicture"
    );

    res.status(201).json(populatedStory);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get Stories
const getStories = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

   const stories = await Story.find({
  author: {
    $in: [...currentUser.following, currentUser._id],
  },
  expiresAt: {
    $gt: new Date(),
  },
})
  .populate("author", "username name profilePicture")
  .sort({ createdAt: -1 });

    res.status(200).json(stories);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Mark Story Viewed
const viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    const alreadyViewed = story.viewers.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!alreadyViewed) {
      story.viewers.push(req.user._id);
      await story.save();
    }

    res.status(200).json({
      message: "Story viewed",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createStory,
  getStories,
  viewStory,
};