const {
  fetchArticles,
  fetchArticleById,
  updateArticleVotes,
  addArticle,
} = require("../models/articles.model.js");

exports.getArticles = (req, res, next) => {
  const { sort_by = "created_at", order = "desc", topic, author } = req.query;

  fetchArticles(sort_by, order, topic, author)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  updateArticleVotes(article_id, inc_votes)
    .then((updatedArticle) => {
      res.status(200).send({ article: updatedArticle });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  addArticle(req.body)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};
