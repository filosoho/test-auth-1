const db = require("../db/connection.js");
const { validateIncVotes } = require("../utils/utils.validation.js");
const {
  articleExists,
  topicExists,
  authorExists,
} = require("./utils.model.js");

exports.fetchArticles = (sort_by, order, topic, author) => {
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

  if (sort_by === "") {
    sort_by = "created_at";
  }
  if (order === "") {
    order = "DESC";
  }

  const orderUpper = order.toUpperCase();

  const validOrder = ["ASC", "DESC"];

  if (!validSortColumns.includes(sort_by) || !validOrder.includes(orderUpper)) {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: Invalid sort_by or order query parameter",
    });
  }

  if (topic === "" || author === "") {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: Topic or Author value missing",
    });
  }

  let queryStr = `
  SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url,
  CAST(COUNT(comments.comment_id) AS INTEGER) AS comment_count
  FROM articles
  LEFT JOIN comments ON comments.article_id = articles.article_id
`;

  const queryParams = [];

  if (topic) {
    queryStr += ` WHERE articles.topic = $${queryParams.length + 1}`;
    queryParams.push(topic);
  }

  if (author) {
    if (queryParams.length > 0) {
      queryStr += ` AND articles.author = $${queryParams.length + 1}`;
    } else {
      queryStr += ` WHERE articles.author = $${queryParams.length + 1}`;
    }
    queryParams.push(author);
  }

  queryStr += `
  GROUP BY articles.article_id
  ORDER BY ${sort_by} ${orderUpper};
`;

  const topicPromise = topic ? topicExists(topic) : Promise.resolve(true);
  const authorPromise = author ? authorExists(author) : Promise.resolve(true);

  return topicPromise
    .then((topicExists) => {
      if (!topicExists) {
        return Promise.reject({
          status: 404,
          msg: "404 - Not Found: Topic not found",
        });
      }
      return authorPromise;
    })
    .then((authorExists) => {
      if (!authorExists) {
        return Promise.reject({
          status: 404,
          msg: "404 - Not Found: Author not found",
        });
      }
      return db.query(queryStr, queryParams);
    })
    .then(({ rows }) => {
      if (rows.length === 0) {
        return [];
      }
      return rows;
    });
};

exports.fetchArticleById = (article_id) => {
  const articleId = Number(article_id);

  const queryStr = `
  SELECT articles.*, CAST(COUNT(comments.comment_id) AS INTEGER) AS comment_count
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
