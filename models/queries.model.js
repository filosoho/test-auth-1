const db = require("../db/connection.js");

exports.selectAllTopicsQuery = (sqlString, queryParams) => {
  return db.query(sqlString, queryParams).then(({ rows: topics }) => {
    return topics;
  });
};
