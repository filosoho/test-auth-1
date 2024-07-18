const {
  fetchAllUsers,
  getUserByUsername,
} = require("../models/users.model.js");

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
