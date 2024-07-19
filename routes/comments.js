const express = require("express");
const router = express.Router();
const {
  getCommentById,
  patchCommentVotes,
  removeCommentById,
} = require("../controllers/comments.controller.js");

router.get("/:comment_id", getCommentById);

router.patch("/:comment_id", patchCommentVotes);

router.delete("/:comment_id", removeCommentById);

module.exports = router;
