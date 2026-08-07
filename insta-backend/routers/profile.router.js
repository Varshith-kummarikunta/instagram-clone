const express = require("express");
const { getProfile } = require("../controllers/profile.controller");
const { updateProfile } = require("../controllers/editProfile.controller");
const { verifyAuth } = require("../middlewares/verifyAuth");

const profileRouter = express.Router();

const parser = require("../utilities/upload");

profileRouter.get("/:username", getProfile);

profileRouter.patch("/", verifyAuth, updateProfile);

profileRouter.post(
  "/upload",
  verifyAuth,
  parser.single("file"),
  (req, res) => {
    try {
      return res.status(200).json({
        imageUrl: req.file.path,
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      });
    }
  }
);

module.exports = {
  profileRouter,
};
