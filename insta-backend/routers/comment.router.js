const express = require("express");
const { verifyAuth } = require("../middlewares/verifyAuth");
const {
  createComment,
  getAllComments,
  updateComment,
} = require("../controllers/comment.controller");

const commentRouter = express.Router();

commentRouter.post("/:postId", verifyAuth, createComment);
commentRouter.get("/:postId", verifyAuth, getAllComments);
commentRouter.patch("/:commentId", verifyAuth, updateComment);

module.exports = { commentRouter };
