const express = require("express");
const app = express();
const endpoints = require("./data/development-data/index.js");
const { getTopics } = require("../controllers/topics.controller.js");
const { getEndpoints } = require("../controllers/api.controller.js");

module.exports = app;

app.use(express.json());

app.get("/api", getEndpoints);
app.get("/api/topics", getTopics);

app.all("*", (req, res, next) => {
  res.status(404).send({ msg: "404 - Not Found: Endpoint does not exist" });
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
});
