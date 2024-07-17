const db = require("../db/connection.js");
const { validateIncVotes } = require("../utils/utils.validation.js");
const { articleExists } = require("./utils.model.js");

exports.fetchArticles = (sort_by = "created_at", order = "desc") => {
  const validSortColumns = [
    "article_id",
    "title",
    "author",
    "body",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrder = ["asc", "desc", "ASC", "DESC"];

  if (!validSortColumns.includes(sort_by) || !validOrder.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: Invalid sort_by or order query parameter",
    });
  }

  let queryStr = `
  SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url,
  COUNT(comments.comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON comments.article_id = articles.article_id
`;

  queryStr += `
  GROUP BY articles.article_id
  ORDER BY ${sort_by} ${order.toUpperCase()};
`;

  return db.query(queryStr).then(({ rows }) => {
    return rows.map((row) => ({
      ...row,
      comment_count: Number(row.comment_count),
    }));
  });
};

exports.fetchArticleById = (article_id) => {
  const articleId = Number(article_id);

  const queryStr = "SELECT * FROM articles WHERE article_id = $1;";
  return db.query(queryStr, [articleId]).then(({ rows }) => {
    const article = rows[0];
    if (!article) {
      return Promise.reject({
        status: 404,
        msg: "404 - Not Found: Article not found",
      });
    }
    return article;
  });
};

exports.updateArticleVotes = (article_id, inc_votes) => {
  return Promise.all([validateIncVotes(inc_votes)]).then(([validIncVotes]) => {
    return articleExists(article_id)
      .then((exists) => {
        if (!exists) {
          return Promise.reject({
            status: 404,
            msg: "404 - Not Found: Article not found",
          });
        }

        const queryStr = `
            UPDATE articles
            SET votes = votes + $1
            WHERE article_id = $2
            RETURNING *;
          `;

        return db.query(queryStr, [validIncVotes, article_id]);
      })
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({
            status: 404,
            msg: "404 - Not Found: Article not found",
          });
        }
        return rows[0];
      });
  });
};
