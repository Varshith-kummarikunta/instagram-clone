require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { userRouter } = require("./routers/user.router");
const { postRouter } = require("./routers/post.router");
const { commentRouter } = require("./routers/comment.router");


const app = express();


const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI;


// Middleware

app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));


// Routes

app.use("/", userRouter);

app.use("/posts", postRouter);

app.use("/comments", commentRouter);


// Database + Server

mongoose
.connect(MONGODB_URI)
.then(() => {

    console.log("Connected to DB");

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

})
.catch((err) => {

    console.log("Failed to connect DB:", err.message);

});