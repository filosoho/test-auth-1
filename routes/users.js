const express = require("express");
const {
  getAllUsers,
  getUserByUsername,
  registerUser,
  loginUser,
  googleLogin,
  guestLogin,
} = require("../controllers/users.controller.js");

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:username", getUserByUsername);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);
router.post("/guest-login", guestLogin);

module.exports = router;
