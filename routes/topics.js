const express = require("express");
const { getTopics, postTopic } = require("../controllers/topics.controller.js");

const router = express.Router();

router.get("/", getTopics);

router.post("/", postTopic);

module.exports = router;
