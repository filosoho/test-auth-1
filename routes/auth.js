const express = require("express");
const router = express.Router();
const {
  googleAuth,
  googleAuthCallback,
} = require("../controllers/auth.controller");

router.get("/google", googleAuth); // Initiates Google login
router.get("/google/callback", googleAuthCallback); // Handles the callback

module.exports = router;
