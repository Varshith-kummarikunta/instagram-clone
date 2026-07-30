const { response } = require("express");
const { Post } = require("../models/post.model");
const { User } = require("../models/user.model");

const getAllPosts = async (request, response) => {
  try {
    const posts = await Post.find().populate("author", "username email name");

    return response.status(200).json(posts);
  } catch (err) {
    console.error("Error in getAllPosts:", err);

    return response.status(500).json({
      message: err.message,
    });
  }
};

const createPost = async (request, response) => {
  const { imageUrl, caption } = request.body;

  if (!imageUrl) {
    return response
      .status(400)
      .json({ message: "Please provide all the details" });
  }

  // check for valid user - if author is valid or not
  try {
    // const user = await User.findById(author);
    // if (!user) {
    //   return response.status(400).json({ message: "Invalid author" });
    // }
    const user = request.user;
    const post = new Post({ author: user._id, imageUrl, caption });
    const savedPost = await post.save();

    if (!savedPost) {
      return response.status(500).json({
        message: "Internal server error",
      });
    }

    const updatedPost = await Post.findById(savedPost._id).populate(
      "author",
      "username email name",
    );

    return response.status(200).json(updatedPost);
  } catch (err) {
    return response.status(500).json({ message: "Internal server error" });
  }
};

const toggleLike = async (request, response) => {
  const { postId } = request.params;
  if (!postId) {
    return response.status(400).json({ message: "Missing post id in the url" });
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return response.status(400).json({ message: "Invalid post id" });
    }

    const userId = request.user._id;
    const isLiked = post.likes.some(
      (id) => id.toString() === userId.toString(),
    );
    // Case 1: if already liked
    // then remove the user from likes array -> post.likes[]
    // do : remove user from post.likes
    if (isLiked) {
      post.likes = post.likes.filter(
        (uid) => uid.toString() !== userId.toString(),
      );
    }
    // Case 2: if not liked
    // then add the user to likes array -> post.likes[]
    // do add user to post.likes
    else {
      post.likes.push(userId);
    }

    // Finally save the post
    const savedPost = await post.save();

    if (!savedPost) {
      return response.status(500).json({
        message: "Internal server error, error while saving the post",
      });
    }

    const updatedPost = await Post.findById(savedPost._id).populate(
      "author",
      "username email name",
    );

    return response.status(200).json(updatedPost);
  } catch (err) {
    return response.status(500).json({ message: "Internal server error" });
  }
};

const updatePost = async (request, response) => {
  const { imageUrl, caption } = request.body;
  const { postId } = request.params;

  if (!imageUrl && !caption) {
    return response
      .status(400)
      .json({ message: "Atleast one field must be present" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return response.status(400).json({ message: "Post not found" });
    }
    // if current user is the owner of the post: if yes -> proceed , else -> error
    if (request.user._id.toString() !== post.author.toString()) {
      return response
        .status(403)
        .json({ message: "Unauthorized to update the post" });
    }

    if (imageUrl) {
      post.imageUrl = imageUrl;
    }
    if (caption) {
      post.caption = caption;
    }

    const savedPost = await post.save();

    if (!savedPost) {
      return response.status(500).json({
        message: "Internal server error",
      });
    }

    const updatedPost = await Post.findById(savedPost._id).populate(
      "author",
      "username email name",
    );

    return response.status(200).json(updatedPost);
  } catch (err) {
    return response.status(500).json({ message: err.message });
  }
};

const deletePost = async (request, response) => {
  const { postId } = request.params;
  console.log(postId);
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return response.status(400).json({ message: "Post not found" });
    }

    if (request.user._id.toString() !== post.author.toString()) {
      return response
        .status(400)
        .json({ message: "Unauthorized to delete this post" });
    }

    const deletedPost = await Post.deleteOne({ _id: post._id });
    console.log(deletedPost);

    return response
      .status(200)
      .json({ deletedPost, message: "Successfully delete post" });
  } catch (err) {
    return response.status(500).json({ message: "Internal sever error" });
  } finally {
    console.log("Inside finally");
  }
};

module.exports = {
  getAllPosts,
  createPost,
  toggleLike,
  updatePost,
  deletePost,
};
