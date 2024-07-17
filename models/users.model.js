const db = require("../db/connection.js");

exports.fetchAllUsers = () => {
  const queryStr = `
    SELECT username, name, avatar_url
    FROM users;
  `;
  return db.query(queryStr).then(({ rows: users }) => users);
};
