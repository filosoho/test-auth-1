const { selectAllTopicsQuery } = require("./queries.model.js");

exports.fetchTopics = () => {
  let queryStr = "SELECT * FROM topics;";
  return selectAllTopicsQuery(queryStr)
    .then((topics) => {
      return topics;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};
