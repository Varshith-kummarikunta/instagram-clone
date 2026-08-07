const express = require("express");

const {
  createConversation,
  getConversations,
} = require("../controllers/conversation.controller");

const { verifyAuth } = require("../middlewares/verifyAuth");

const conversationRouter = express.Router();

conversationRouter.post("/", verifyAuth, createConversation);

conversationRouter.get("/", verifyAuth, getConversations);

module.exports = {
  conversationRouter,
};