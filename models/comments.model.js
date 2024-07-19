const db = require("../db/connection.js");
const {
  articleExists,
  checkUserExists,
  commentExists,
} = require("./utils.model.js");
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

exports.fetchCommentById = (comment_id) => {
  const queryStr = `
    SELECT * FROM comments WHERE comment_id = $1;
  `;

  return db.query(queryStr, [comment_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: "404 - Not Found: Comment not found",
      });
    }
    return rows[0];
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

exports.updateCommentVotes = (comment_id, inc_votes) => {
  return commentExists(comment_id).then((exists) => {
    if (!exists) {
      return Promise.reject({
        status: 404,
        msg: "404 - Not Found: Comment not found",
      });
    }

    const queryStr = `
    UPDATE comments
    SET votes = votes + $2
    WHERE comment_id = $1
    RETURNING *;
  `;
    return db.query(queryStr, [comment_id, inc_votes]).then(({ rows }) => {
      if (rows === 0) {
        return res.status(404).send({
          msg: "404 - Not Found: Comment not found",
        });
      }
      return rows[0];
    });
  });
};

exports.deleteCommentById = (comment_id) => {
  return commentExists(comment_id).then(() => {
    if (comment_id <= 0) {
      return Promise.reject({
        status: 400,
        msg: "400 - Bad Request: invalid_id",
      });
    }

    const queryStr = `
    DELETE FROM comments
    WHERE comment_id = $1
    RETURNING *;
  `;

    return db.query(queryStr, [comment_id]).then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "404 - Not Found: Comment not found",
        });
      }
    });
  });
};
