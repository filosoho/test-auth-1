const express = require("express");
const router = express.Router();

const { getAllUsers } = require("../controllers/users.controller.js");

router.get("/", getAllUsers);

module.exports = router;
