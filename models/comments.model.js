const db = require("../db/connection.js");
const { articleExists } = require("../utils/utils.validations.js");

exports.fetchCommentsByArticleId = (article_id) => {
  const articleId = Number(article_id);

  return articleExists(articleId)
    .then((exists) => {
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

      return db.query(queryStr, [articleId]).then(({ rows: comments }) => {
        if (comments.length === 0) {
          return [];
        }
        return comments;
      });
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};
