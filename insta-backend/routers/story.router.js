const express = require("express");

const {
  createStory,
  getStories,
  viewStory,
} = require("../controllers/story.controller");

const { verifyAuth } = require("../middlewares/verifyAuth");

const storyRouter = express.Router();

storyRouter.post("/", verifyAuth, createStory);

storyRouter.get("/", verifyAuth, getStories);

storyRouter.patch("/:storyId/view", verifyAuth, viewStory);

module.exports = {
  storyRouter,
};