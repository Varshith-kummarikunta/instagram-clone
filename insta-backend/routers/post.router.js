const express = require("express");
const { verifyAuth } = require("../middlewares/verifyAuth");
const {
  getAllPosts,
  createPost,
  toggleLike,
  updatePost,
  deletePost,
} = require("../controllers/post.controller");
const parser = require("../utilities/upload");

const postRouter = express.Router();

// method: get, route: /posts , middleware: verifyAuth, controller: getAllPosts
postRouter.get("/", verifyAuth, getAllPosts);
// method: get, route: /posts , middleware: verifyAuth, controller: createPost
postRouter.post("/", verifyAuth, createPost);
// method: post, route: /posts/like/:postId, middleware: verifyAuth, controller: toggleLike
postRouter.post("/like/:postId", verifyAuth, toggleLike);
// method: put, route: /posts/:postId, middleware: verifyAuth, controller: updatePost
postRouter.patch("/:postId", verifyAuth, updatePost);
postRouter.delete("/:postId", verifyAuth, deletePost);
//upload
postRouter.post("/upload", verifyAuth, parser.single("file"), (req,res)=>{
  try{
    const url = req.file.path;
    return res.status(200).json({imageUrl: url});
  } catch (err) {
    return res.status(500).json({message:err.message})
  }

});

module.exports = { postRouter };
