const { response } = require("express");
const { Comment } = require("../models/comment.model");
const { Post } = require("../models/post.model");
const { Notification } = require("../models/notification.model");
const { sendNotification } = require("../utilities/sendNotification");

const createComment = async (request, response) => {
  const { text } = request.body;
  const { postId } = request.params;
  // Step 1: check if text is undefined -> return error
  if (!text) {
    return response
      .status(400)
      .json({ message: "Please provide the text of the comment" });
  }

  try {
    // Step 2: find the post -> if no post, return error, else continue
    const post = await Post.findById(postId);
    if (!post) {
      return response.status(400).json({ message: "This post does not exist" });
    }

    // Step 3: Create a new comment
    const comment = new Comment({
      author: request.user._id,
      text,
      post: postId,
    });

    // Step 4: Save the comment
    const savedComment = await comment.save();
    if (!savedComment) {
      return response.status(500).json({ message: "Internal server error" });
    }

    // CREATE COMMENT NOTIFICATION

    if (post.author.toString() !== request.user._id.toString()) {
      await Notification.create({
        recipient: post.author,

        sender: request.user._id,

        type: "comment",

        post: post._id,
      });

      sendNotification(post.author.toString(), {
        type: "comment",
        post: post._id,
        sender: {
          username: request.user.username,
          profilePicture: request.user.profilePicture,
        },
      });
    }

    // Step 5: Update the commentCount in the post and save the post
    post.commentCount = post.commentCount + 1;
    const savedPost = await post.save();
    if (!savedPost) {
      return response.status(500).json({ message: "Internal server error" });
    }

    // Step 6: successful response with author details
    const populatedComment = await Comment.findById(savedComment._id).populate(
      "author",
      "username name email",
    );

    return response.status(200).json(populatedComment);
  } catch (err) {
    return response.status(500).json({ message: err.message });
  }
};

const getAllComments = async (request, response) => {
  const { postId } = request.params;
  try {
    const comments = await Comment.find({ post: postId })
      .populate("author", "name username profilePicture")
      .sort({ createdAt: -1 });

    return response.status(200).json(comments);
  } catch (err) {
    return response.status(500).json({ message: err.message });
  }
};

const updateComment = async (request, response) => {
  const { commentId } = request.params;
  const { text } = request.body;

  if (!text) {
    return response
      .status(400)
      .json({ message: "Please fill the updated text" });
  }

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return response.status(400).json({ message: "Invalid comment id" });
    }

    if (request.user._id.toString() !== comment.author.toString()) {
      return response
        .status(400)
        .json({ message: "Unauthorized to update the comment" });
    }

    comment.text = text;

    const savedComment = await comment.save();
    if (!savedComment) {
      return response.status(500).json({ message: "Internal server error" });
    }

    return response.status(200).json(savedComment);
  } catch (err) {
    return response.status(500).json({ message: err.message });
  }
};

module.exports = { createComment, getAllComments, updateComment };
