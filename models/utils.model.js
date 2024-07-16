const db = require("../db/connection.js");

exports.articleExists = (article_id) => {
  if (isNaN(article_id)) {
    return Promise.resolve(false);
  }
  const articleId = Number(article_id);

  const queryStr = `
    SELECT 1
    FROM articles
    WHERE article_id = $1;
  `;

  return db.query(queryStr, [articleId]).then(({ rows }) => {
    return rows.length > 0;
  });
};

exports.checkUserExists = (username) => {
  if (typeof username !== "string") {
    return Promise.resolve(false);
  }

  const queryStr = `
    SELECT 1 
    FROM users
    WHERE username = $1;
  `;

  return db.query(queryStr, [username]).then(({ rows }) => {
    return rows.length > 0;
  });
};

exports.commentExists = (comment_id) => {
  const queryStr = `
    SELECT 1
    FROM comments
    WHERE comment_id = $1;
  `;

  return db.query(queryStr, [comment_id]).then(({ rows }) => {
    return rows.length > 0;
  });
};
