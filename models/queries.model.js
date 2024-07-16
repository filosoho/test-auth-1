const db = require("../db/connection.js");

exports.selectAllTopicsQuery = (sqlString) => {
  return db.query(sqlString).then(({ rows: topics }) => {
    return topics;
  });
};

exports.selectArticleByIdQuery = (article_id) => {
  const queryStr = "SELECT * FROM articles WHERE article_id = $1;";
  return db.query(queryStr, [article_id]).then(({ rows }) => {
    return rows[0];
  });
};
