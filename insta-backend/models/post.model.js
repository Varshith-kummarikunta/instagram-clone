const mongoose = require("mongoose");
// type -> mongoose.Schema.Types.ObjectId
// represents -> mongoose _id type
const postSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  caption: { type: String, default: "" },
  imageUrl: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  commentCount: { type: Number, default: 0, minlength: 0 },
});

const Post = mongoose.model("Post", postSchema);

module.exports = { Post };
