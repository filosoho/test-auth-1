const db = require("../db/connection.js");
const {
  validateArticleId,
  validateIncVotes,
} = require("../utils/utils.validation.js");
const { articleExists } = require("./utils.model.js");

exports.fetchArticles = () => {
  const queryStr = `
  SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url,
  COUNT(comments.comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON comments.article_id = articles.article_id
  GROUP BY articles.article_id
  ORDER BY articles.created_at DESC;
`;
  return db
    .query(queryStr)
    .then(({ rows: articles }) => {
      return articles;
    })
    .catch((err) => {
      return Promise.reject(err);
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
