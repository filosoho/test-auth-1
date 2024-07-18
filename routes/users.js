const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserByUsername,
} = require("../controllers/users.controller.js");

router.get("/", getAllUsers);

router.get("/:username", getUserByUsername);

module.exports = router;
