const db = require("../db/connection.js");
const { articleExists, checkUserExists } = require("./utils.model.js");
const {
  validateArticleId,
  validateUsername,
  validateCommentBody,
} = require("../utils/utils.validation.js");

exports.fetchCommentsByArticleId = (article_id) => {
  return validateArticleId(article_id).then((articleId) => {
    return articleExists(articleId).then((exists) => {
      if (!exists) {
        return Promise.reject({
          status: 404,
          msg: "404 - Not Found: Article not found",
        });
      }

      const queryStr = `
          SELECT comment_id, votes, created_at, author, body, article_id
          FROM comments
          WHERE article_id = $1
          ORDER BY created_at DESC;
        `;

      return db
        .query(queryStr, [articleId])
        .then(({ rows: comments }) => comments);
    });
  });
};

exports.addCommentForArticle = (username, body, article_id) => {
  return Promise.all([
    validateArticleId(article_id),
    validateUsername(username),
    validateCommentBody(body),
  ]).then(([articleId, validUsername, validBody]) => {
    return Promise.all([
      articleExists(articleId),
      checkUserExists(validUsername),
    ]).then(([articleExists, userExists]) => {
      if (!articleExists) {
        return Promise.reject({
          status: 404,
          msg: "404 - Not Found: Article not found",
        });
      }
      if (!userExists) {
        return Promise.reject({
          status: 404,
          msg: "404 - Not Found: User does not exist",
        });
      }

      const queryStr = `
          INSERT INTO comments (author, body, article_id)
          VALUES ($1, $2, $3)
          RETURNING *;
        `;

      return db
        .query(queryStr, [validUsername, validBody, articleId])
        .then(({ rows: [comment] }) => comment);
    });
  });
};
