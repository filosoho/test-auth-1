const { selectArticleByIdQuery } = require("./queries.model.js");

exports.fetchArticleById = (article_id) => {
  const articleId = Number(article_id);
  if (isNaN(articleId)) {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: Invalid article_id",
    });
  }

  return selectArticleByIdQuery(articleId)
    .then((article) => {
      if (!article) {
        return Promise.reject({
          status: 404,
          msg: "404 - Not Found: Article not found",
        });
      }
      return article;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};
