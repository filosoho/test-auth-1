const express = require("express");
const router = express.Router();

const {
  getArticles,
  getArticleById,
  patchArticleById,
  postArticle,
} = require("../controllers/articles.controller.js");
const {
  getCommentsByArticleId,
  postCommentForArticle,
} = require("../controllers/comments.controller.js");

router.get("/", getArticles);
router.get("/:article_id", getArticleById);
router.get("/:article_id/comments", getCommentsByArticleId);

router.post("/", postArticle);
router.post("/:article_id/comments", postCommentForArticle);

router.patch("/:article_id", patchArticleById);

module.exports = router;
