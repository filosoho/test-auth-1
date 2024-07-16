const db = require("../db/connection.js");

exports.fetchTopics = () => {
  const queryStr = "SELECT * FROM topics;";
  return db
    .query(queryStr)
    .then(({ rows: topics }) => {
      return topics;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};
