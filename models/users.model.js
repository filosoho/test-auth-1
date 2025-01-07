const db = require("../db/connection.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

exports.createUser = ({ email, password, name, username }) => {
  if (!email || !password || !name || !username) {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: Missing fields",
    });
  }

  return bcrypt
    .hash(password, 10)
    .then((hashedPassword) => {
      const queryStr = `
      INSERT INTO users (email, password, name , username)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, username;
    `;

      return db.query(queryStr, [email, hashedPassword, name, username]);
    })
    .then(({ rows }) => {
      const user = rows[0];
      const token = jwt.sign(
        { user_id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return { user, token };
    });
};

exports.authenticateUser = (email, password) => {
  if (!email || !password) {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: Missing fields",
    });
  }

  const queryStr = `
    SELECT id, email, password, name
    FROM users
    WHERE email = $1;
  `;

  return db.query(queryStr, [email]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 401,
        msg: "401 - Unauthorized: Invalid credentials",
      });
    }

    const user = rows[0];
    return bcrypt.compare(password, user.password).then((isPasswordValid) => {
      if (!isPasswordValid) {
        return Promise.reject({
          status: 401,
          msg: "401 - Unauthorized: Invalid credentials",
        });
      }

      const token = jwt.sign(
        { user_id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return { user, token };
    });
  });
};

exports.findOrCreateGoogleUser = ({ googleId, name, email, username }) => {
  if (!googleId || !name || !email || !username) {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: Missing fields",
    });
  }

  const queryStr = `
    INSERT INTO users (google_id, name, email, username)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (google_id)
    DO UPDATE SET name = $2, email = $3
    RETURNING id, google_id, name, email, username;
  `;

  return db
    .query(queryStr, [googleId, name, email, username])
    .then(({ rows }) => {
      const user = rows[0];
      const token = jwt.sign(
        { user_id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return { user, token };
    });
};

exports.createGuestToken = () => {
  const token = jwt.sign(
    { user_id: "guest", guest: true },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { user: { name: "Guest" }, token };
};
