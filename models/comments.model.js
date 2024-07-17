const db = require("../db/connection.js");
const { articleExists, checkUserExists } = require("./utils.model.js");
const {
  validateUsername,
  validateCommentBody,
} = require("../utils/utils.validation.js");

exports.fetchCommentsByArticleId = (article_id) => {
  return articleExists(article_id).then((exists) => {
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
      .query(queryStr, [article_id])
      .then(({ rows: comments }) => comments);
  });
};

exports.addCommentForArticle = (username, body, article_id) => {
  return Promise.all([
    validateUsername(username),
    validateCommentBody(body),
  ]).then(([validUsername, validBody]) => {
    return Promise.all([
      articleExists(article_id),
      checkUserExists(validUsername),
    ]).then(() => {
      const queryStr = `
          INSERT INTO comments (author, body, article_id)
          VALUES ($1, $2, $3)
          RETURNING *;
        `;

      return db
        .query(queryStr, [validUsername, validBody, article_id])
        .then(({ rows: [comment] }) => comment);
    });
  });
};
