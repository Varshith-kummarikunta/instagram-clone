const express = require("express");

const {
  getNotifications,
  markNotificationRead,
} = require("../controllers/notification.controller");

const { verifyAuth } = require("../middlewares/verifyAuth");

const notificationRouter = express.Router();

notificationRouter.get("/", verifyAuth, getNotifications);

notificationRouter.patch("/:id", verifyAuth, markNotificationRead);

module.exports = {
  notificationRouter,
};
