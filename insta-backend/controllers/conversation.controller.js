const { Conversation } = require("../models/conversation.model");

// Create or Get Existing Conversation
const createConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const currentUserId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({
        message: "Receiver id is required",
      });
    }

    if (currentUserId.toString() === receiverId.toString()) {
      return res.status(400).json({
        message: "Cannot create conversation with yourself",
      });
    }


    const existingConversation = await Conversation.findOne({
      members: {
        $all: [currentUserId, receiverId],
      },
    }).populate("members", "username profilePicture");


    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }


   const conversation = await Conversation.create({
  members: [currentUserId, receiverId],
  unreadCounts: [
    {
      user: currentUserId,
      count: 0,
    },
    {
      user: receiverId,
      count: 0,
    },
  ],
});


    const populatedConversation = await Conversation.findById(
      conversation._id
    ).populate("members", "username profilePicture");


    return res.status(201).json(populatedConversation);


  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
// Get All Conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: req.user._id,
    })
      .populate("members", "username profilePicture")
      .sort({
        lastMessageAt: -1,
      });

    const result = conversations.map((conversation) => {
      const unread =
        conversation.unreadCounts.find(
          (u) => u.user.toString() === req.user._id.toString()
        )?.count || 0;

      return {
        ...conversation.toObject(),
        unreadCount: unread,
      };
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createConversation,
  getConversations,
};