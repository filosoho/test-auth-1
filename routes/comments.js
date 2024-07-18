const express = require("express");
const router = express.Router();
const { removeCommentById } = require("../controllers/comments.controller.js");

router.delete("/:comment_id", removeCommentById);

module.exports = router;
