const db = require("../db/connection.js");

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
