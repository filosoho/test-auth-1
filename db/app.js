const express = require("express");
const app = express();
const { getEndpoints } = require("../controllers/api.controller.js");
const { getTopics } = require("../controllers/topics.controller.js");
const {
  getArticles,
  getArticleById,
  patchArticleById,
} = require("../controllers/articles.controller.js");
const {
  getCommentsByArticleId,
  postCommentForArticle,
  removeCommentById,
} = require("../controllers/comments.controller.js");

module.exports = app;

app.use(express.json());

app.get("/api", getEndpoints);
app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentForArticle);

app.patch("/api/articles/:article_id", patchArticleById);

app.delete("/api/comments/:comment_id", removeCommentById);

app.all("*", (req, res, next) => {
  res.status(404).send({ msg: "404 - Not Found: Endpoint does not exist" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({
      msg: "400 - Bad Request: invalid_id",
    });
  } else if (err.code === "23502") {
    res.status(400).send({
      msg: "400 - Bad Request: Missing required fields",
    });
  } else if (err.code === "23503") {
    res.status(404).send({
      msg: "404 - Not Found: Article or User does not exist",
    });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
});
