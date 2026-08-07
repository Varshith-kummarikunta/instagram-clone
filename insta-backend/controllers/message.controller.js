const { Message } = require("../models/message.model");
const { Conversation } = require("../models/conversation.model");
const { sendNotification } = require("../utilities/sendNotification");
const { getUserSocket } = require("../utilities/onlineUsers");
const { getIO } = require("../utilities/socket");

const sendMessage = async (req, res) => {
  const sender = req.user._id;
  const { receiverId, text } = req.body;

  try {
    let conversation = await Conversation.findOne({
      members: { $all: [sender, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [sender, receiverId],
        unreadCounts: [
          { user: sender, count: 0 },
          { user: receiverId, count: 0 },
        ],
      });
    }

    const message = await Message.create({
      sender,
      receiver: receiverId,
      text,
    });

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "username profilePicture",
    );

    conversation.lastMessage = text;
    conversation.lastMessageAt = new Date();

   if (!conversation.unreadCounts) {
  conversation.unreadCounts = [];
}

let unread = conversation.unreadCounts.find(
  (u) => u.user.toString() === receiverId.toString()
);

if (!unread) {
  conversation.unreadCounts.push({
    user: receiverId,
    count: 1,
  });
} else {
  unread.count += 1;
}

    await conversation.save();

    const receiverSocketId = getUserSocket(receiverId);

    if (receiverSocketId) {
      const io = getIO();

      io.to(receiverSocketId).emit("receiveMessage", {
        conversationId: conversation._id,
        message: populatedMessage,
      });
    }

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getMessages = async (req, res) => {
  const { receiverId } = req.params;
  const sender = req.user._id;

  try {
    const messages = await Message.find({
      $or: [
        { sender, receiver: receiverId },
        { sender: receiverId, receiver: sender },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const markMessagesSeen = async (req, res) => {
  const { senderId } = req.params;
  const receiverId = req.user._id;

  try {
    await Message.updateMany(
      {
        sender: senderId,
        receiver: receiverId,
        seen: false,
      },
      {
        seen: true,
      },
    );

    const conversation = await Conversation.findOne({
      members: {
        $all: [senderId, receiverId],
      },
    });

    if (conversation) {
      if (!conversation.unreadCounts) {
  conversation.unreadCounts = [];
}

let unread = conversation.unreadCounts.find(
  (u) => u.user.toString() === receiverId.toString()
);

if (!unread) {
  conversation.unreadCounts.push({
    user: receiverId,
    count: 0,
  });
} else {
  unread.count = 0;
}

      await conversation.save();
    }

    res.status(200).json({
      message: "Messages marked as seen",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markMessagesSeen,
};
