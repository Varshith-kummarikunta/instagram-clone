const { Message } = require("../models/message.model");
const { Conversation } = require("../models/conversation.model");
const { sendNotification } = require("../utilities/sendNotification");
const { getUserSocket } = require("../utilities/onlineUsers");
const { getIO } = require("../utilities/socket");

const sendMessage = async (req, res) => {
  const sender = req.user._id;
  const { receiverId, text, imageUrl, replyTo } = req.body;

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
      text: text || "",
      imageUrl: imageUrl || "",
      replyTo: replyTo || null,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username profilePicture")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "username profilePicture",
        },
      });

    conversation.lastMessage = imageUrl ? "📷 Photo" : text;
    conversation.lastMessageAt = new Date();

    if (!conversation.unreadCounts) {
      conversation.unreadCounts = [];
    }

    let unread = conversation.unreadCounts.find(
      (u) => u.user.toString() === receiverId.toString(),
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
    const conversation = await Conversation.findOne({
      members: {
        $all: [sender, receiverId],
      },
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender, receiver: receiverId },
        { sender: receiverId, receiver: sender },
      ],
    })
      .populate("sender", "username profilePicture")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "username profilePicture",
        },
      })
      .sort({ createdAt: 1 });

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
        (u) => u.user.toString() === receiverId.toString(),
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
      const senderSocketId = getUserSocket(senderId);

      if (senderSocketId) {
        const io = getIO();

        io.to(senderSocketId).emit("messagesSeen", {
          senderId,
          receiverId,
        });
      }
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

const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Only the sender can delete the message
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You can only delete your own messages",
      });
    }

    const receiverId = message.receiver;

    await Message.findByIdAndDelete(messageId);

    // Notify receiver in real time
    const receiverSocketId = getUserSocket(receiverId);
    const senderSocketId = getUserSocket(message.sender);

    const io = getIO();

    const deletePayload = {
      messageId,
    };

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", deletePayload);
    }

    if (senderSocketId && senderSocketId !== receiverSocketId) {
      io.to(senderSocketId).emit("messageDeleted", deletePayload);
    }

    res.status(200).json({
      message: "Message deleted successfully",
      messageId,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const editMessage = async (req, res) => {
  const { messageId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  try {
    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Message text cannot be empty",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Only the sender can edit the message
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You can only edit your own messages",
      });
    }

    // Image-only messages cannot be edited
    if (!message.text || !message.text.trim()) {
      return res.status(400).json({
        message: "Only text messages can be edited",
      });
    }

    message.text = text.trim();
    message.edited = true;

    await message.save();

    const receiverSocketId = getUserSocket(message.receiver);
    const senderSocketId = getUserSocket(message.sender);

    const io = getIO();

    const editPayload = {
      messageId: message._id,
      text: message.text,
      edited: true,
    };

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", editPayload);
    }

    if (senderSocketId && senderSocketId !== receiverSocketId) {
      io.to(senderSocketId).emit("messageEdited", editPayload);
    }

    res.status(200).json({
      message: "Message edited successfully",
      updatedMessage: message,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const toggleReaction = async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user._id;

  try {
    if (!emoji) {
      return res.status(400).json({
        message: "Emoji is required",
      });
    }

    const allowedEmojis = ["❤️", "😂", "👍", "😮", "😢"];

    if (!allowedEmojis.includes(emoji)) {
      return res.status(400).json({
        message: "Invalid reaction",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    const isParticipant =
      message.sender.toString() === userId.toString() ||
      message.receiver.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not a participant in this conversation",
      });
    }

    if (!message.reactions) {
      message.reactions = [];
    }

    const existingReaction = message.reactions.find(
      (reaction) => reaction.user.toString() === userId.toString(),
    );

    if (existingReaction) {
      if (existingReaction.emoji === emoji) {
        // Clicking the same reaction removes it
        message.reactions = message.reactions.filter(
          (reaction) =>
            !(
              reaction.user.toString() === userId.toString() &&
              reaction.emoji === emoji
            ),
        );
      } else {
        // Change existing reaction
        existingReaction.emoji = emoji;
      }
    } else {
      // Add new reaction
      message.reactions.push({
        user: userId,
        emoji,
      });
    }

    await message.save();
    console.log("REACTION SAVED:", {
      messageId: message._id,
      edited: message.edited,
      reactions: message.reactions,
    });

    const receiverSocketId = getUserSocket(message.receiver);
    const senderSocketId = getUserSocket(message.sender);

    const io = getIO();

    const reactionPayload = {
      messageId: message._id,
      reactions: message.reactions,
    };

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReaction", reactionPayload);
    }

    if (senderSocketId && senderSocketId !== receiverSocketId) {
      io.to(senderSocketId).emit("messageReaction", reactionPayload);
    }

    res.status(200).json({
      message: "Reaction updated successfully",
      reactions: message.reactions,
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
  deleteMessage,
  editMessage,
  toggleReaction,
};
