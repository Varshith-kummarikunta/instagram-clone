const express = require("express");

const {
  sendMessage,
  getMessages,
  markMessagesSeen,
  deleteMessage,
  editMessage,
  toggleReaction,
} = require("../controllers/message.controller");
const { verifyAuth } = require("../middlewares/verifyAuth");

const messageRouter = express.Router();

messageRouter.post("/", verifyAuth, sendMessage);

messageRouter.get("/:receiverId", verifyAuth, getMessages);

messageRouter.patch("/seen/:senderId", verifyAuth, markMessagesSeen);

messageRouter.patch(
  "/:messageId/reaction",
  verifyAuth,
  toggleReaction,
);

messageRouter.delete("/:messageId", verifyAuth, deleteMessage);

messageRouter.patch("/:messageId", verifyAuth, editMessage);
module.exports = {
  messageRouter,
};
