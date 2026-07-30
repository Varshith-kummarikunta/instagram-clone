require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { userRouter } = require("./routers/user.router");
const { postRouter } = require("./routers/post.router");
const { commentRouter } = require("./routers/comment.router");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware, common mistake
app.use(express.json());
app.use(cors());

// login/signup routes
app.use("/", userRouter);
// post routes
app.use("/posts", postRouter);
// comment routes
app.use("/comments", commentRouter);

app.listen(PORT, () => {
  console.log("Listening on port ", PORT);
});

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("Failed to connect", err.message));
