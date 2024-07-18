const express = require("express");
const app = express();
const { getEndpoints } = require("../controllers/api.controller.js");
const { getTopics } = require("../controllers/topics.controller.js");
const articlesRouter = require("../routes/articles.js");
const commentsRouter = require("../routes/comments.js");
const usersRouter = require("../routes/users.js");
const {
  handle404s,
  handleSpecificErrors,
  handleGenericErrors,
} = require("../middleware/errorHandlers.js");

app.use(express.json());

app.get("/api", getEndpoints);
app.get("/api/topics", getTopics);

app.use("/api/articles", articlesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/users", usersRouter);

app.all("*", handle404s);
app.use(handleSpecificErrors);
app.use(handleGenericErrors);

module.exports = app;
