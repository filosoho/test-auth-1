const db = require("../db/connection.js");

exports.fetchAllUsers = () => {
  const queryStr = `
    SELECT username, name, avatar_url
    FROM users;
  `;
  return db.query(queryStr).then(({ rows: users }) => users);
};

exports.getUserByUsername = (username) => {
  if (!username || username === "" || typeof username !== "string") {
    return res.status(400).send({
      msg: "400 - Bad Request: Username parameter is required",
    });
  }

  const queryStr = `
    SELECT username, avatar_url, name
    FROM users
    WHERE username = $1;
  `;

  return db.query(queryStr, [username]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: "404 - Not Found: User not found",
      });
    }
    return rows[0];
  });
};
