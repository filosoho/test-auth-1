const db = require("../db/connection.js");

exports.articleExists = (article_id) => {
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
