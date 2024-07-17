const {
  fetchCommentsByArticleId,
  addCommentForArticle,
  deleteCommentById,
} = require("../models/comments.model.js");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  fetchCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentForArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  addCommentForArticle(username, body, article_id)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.removeCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  deleteCommentById(comment_id)
    .then(() => {
      res
        .status(204)
        .send({
          msg: "The comment was successfully deleted. No content is returned.",
        });
    })
    .catch(next);
};
