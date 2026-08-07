require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { userRouter } = require("./routers/user.router");
const { postRouter } = require("./routers/post.router");
const { commentRouter } = require("./routers/comment.router");
const { profileRouter } = require("./routers/profile.router");
const { followRouter } = require("./routers/follow.router");
const { searchRouter } = require("./routers/search.router");
const { notificationRouter } = require("./routers/notification.router");
const { setIO } = require("./utilities/socket");
const { storyRouter } = require("./routers/story.router");
const { conversationRouter } = require("./routers/conversation.router");
const { messageRouter } = require("./routers/message.router");

const app = express();

const http = require("http");

const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});
setIO(io);
const {
  addUser,
  removeUser,
  getOnlineUsers,
} = require("./utilities/onlineUsers");

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
socket.on("join", (userId) => {
  addUser(userId, socket.id);

  // send currently online users
  socket.emit("onlineUsers", getOnlineUsers());

  // notify everyone else
  socket.broadcast.emit("userOnline", userId);

  console.log("User joined socket:", userId);
});
  socket.on("disconnect", () => {
    const removedUserId = removeUser(socket.id);

    if (removedUserId) {
      socket.broadcast.emit("userOffline", removedUserId);
    }

    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Routes

app.use("/", userRouter);

app.use("/posts", postRouter);

app.use("/comments", commentRouter);

app.use("/profile", profileRouter);

app.use("/follow", followRouter);

app.use("/search", searchRouter);

app.use("/notifications", notificationRouter);

app.use("/stories", storyRouter);

app.use("/conversations", conversationRouter);

app.use("/messages", messageRouter);

// Database + Server

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to DB");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Failed to connect DB:", err.message);
  });
