const express = require("express");
const { verifyAuth } = require("../middlewares/verifyAuth");
const { toggleFollow } = require("../controllers/follow.controller");

const followRouter = express.Router();

followRouter.patch("/:userId", verifyAuth, toggleFollow);

module.exports = {
  followRouter,
};