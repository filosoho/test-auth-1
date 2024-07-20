const { fetchTopics, addTopic } = require("../models/topics.model.js");

exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.postTopic = (req, res, next) => {
  const topicData = req.body;

  addTopic(topicData)
    .then((newTopic) => {
      res.status(201).send(newTopic);
    })
    .catch(next);
};
