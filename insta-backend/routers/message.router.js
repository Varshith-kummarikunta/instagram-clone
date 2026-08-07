const express = require("express");

const {
  sendMessage,
  getMessages,
  markMessagesSeen,
} = require("../controllers/message.controller");
const { verifyAuth } = require("../middlewares/verifyAuth");

const messageRouter = express.Router();

messageRouter.post("/", verifyAuth, sendMessage);

messageRouter.get("/:receiverId", verifyAuth, getMessages);

messageRouter.patch(
  "/seen/:senderId",
  verifyAuth,
  markMessagesSeen
);

module.exports = {
  messageRouter,
};