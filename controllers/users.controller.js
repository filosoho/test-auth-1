const {
  fetchAllUsers,
  getUserByUsername,
  createUser,
  authenticateUser,
  findOrCreateGoogleUser,
  createGuestToken,
} = require("../models/users.model.js");
const jwt = require("jsonwebtoken");

exports.getAllUsers = (req, res, next) => {
  fetchAllUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;

  getUserByUsername(username)
    .then((user) => {
      if (!user) {
        return Promise.reject({
          status: 404,
          msg: "404 - Not Found: User not found",
        });
      }
      res.status(200).send({ user });
    })
    .catch(next);
};

exports.registerUser = (req, res, next) => {
  const { email, password, name, username } = req.body;

  createUser({ email, password, name, username })
    .then(({ user, token }) => {
      res.status(201).send({ user, token });
    })
    .catch(next);
};

exports.loginUser = (req, res, next) => {
  const { email, password } = req.body;

  authenticateUser(email, password)
    .then(({ user, token }) => {
      res.status(200).send({ user, token });
    })
    .catch(next);
};

exports.googleLogin = (req, res, next) => {
  const { googleId, name, email, username } = req.body;

  findOrCreateGoogleUser({ googleId, name, email, username })
    .then(({ user, token }) => {
      res.status(200).send({ user, token });
    })
    .catch(next);
};

exports.guestLogin = (req, res) => {
  const { user, token } = createGuestToken();
  res.status(200).send({ user, token });
};
