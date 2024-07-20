const {
  fetchCommentsByArticleId,
  addCommentForArticle,
  fetchCommentById,
  updateCommentVotes,
  deleteCommentById,
} = require("../models/comments.model.js");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { limit, page } = req.query;

  fetchCommentsByArticleId(article_id, limit, page)
    .then(({ comments, total_count }) => {
      res.status(200).send({ comments, total_count });
    })
    .catch(next);
};

exports.getCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  fetchCommentById(comment_id)
    .then((comment) => {
      res.status(200).send({ comment });
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

exports.patchCommentVotes = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;

  updateCommentVotes(comment_id, inc_votes)
    .then((updatedComment) => {
      res.status(200).send({ comment: updatedComment });
    })
    .catch(next);
};

exports.removeCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  deleteCommentById(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};
