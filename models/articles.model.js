const db = require("../db/connection.js");
const { validateIncVotes } = require("../utils/utils.validation.js");
const { articleExists, topicExists } = require("./utils.model.js");

exports.fetchArticles = (sort_by = "created_at", order = "desc", topic) => {
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

  if (topic === "") {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: Topic value missing",
    });
  }

  let queryStr = `
  SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url,
  COUNT(comments.comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON comments.article_id = articles.article_id
`;

  const queryParams = [];

  if (topic) {
    queryStr += ` WHERE articles.topic = $${queryParams.length + 1}`;
    queryParams.push(topic);
  }

  queryStr += `
  GROUP BY articles.article_id
  ORDER BY ${sort_by} ${order.toUpperCase()};
`;
  return topicExists(topic).then(() => {
    return db.query(queryStr, queryParams).then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "404 - Not Found: topic  not found",
        });
      }
      return rows.map((row) => ({
        ...row,
        comment_count: Number(row.comment_count),
      }));
    });
  });
};

exports.fetchArticleById = (article_id) => {
  const articleId = Number(article_id);

  const queryStr = `
  SELECT articles.*, COUNT(comments.comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON comments.article_id = articles.article_id
  WHERE articles.article_id = $1
  GROUP BY articles.article_id;
`;

  return db.query(queryStr, [articleId]).then(({ rows }) => {
    const article = rows[0];
    if (!article) {
      return Promise.reject({
        status: 404,
        msg: "404 - Not Found: Article not found",
      });
    }
    article.comment_count = Number(article.comment_count);
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
