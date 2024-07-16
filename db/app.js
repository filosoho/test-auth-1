const express = require("express");
const app = express();
const { getTopics } = require("../controllers/topics.controller.js");
const { getEndpoints } = require("../controllers/api.controller.js");
const {
  getArticles,
  getArticleById,
} = require("../controllers/articles.controller.js");
const {
  getCommentsByArticleId,
} = require("../controllers/comments.controller.js");

module.exports = app;

app.use(express.json());

app.get("/api", getEndpoints);
app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.all("*", (req, res, next) => {
  res.status(404).send({ msg: "404 - Not Found: Endpoint does not exist" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({
      msg: "400 - Bad Request: Invalid article_id",
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
