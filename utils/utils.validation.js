exports.validateUsername = (username) => {
  if (username !== undefined)
    if (typeof username !== "string") {
      return Promise.reject({
        status: 400,
        msg: "400 - Bad Request: username must be a string",
      });
    }
  return Promise.resolve(username);
};

exports.validateCommentBody = (body) => {
  if (body !== undefined) {
    if (typeof body !== "string") {
      return Promise.reject({
        status: 400,
        msg: "400 - Bad Request: body must be a string",
      });
    }
    if (body.trim() === "") {
      return Promise.reject({
        status: 400,
        msg: "400 - Bad Request: Comment body cannot be empty",
      });
    }
  }

  return Promise.resolve(body);
};

exports.validateIncVotes = (inc_votes) => {
  if (typeof inc_votes !== "number") {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: inc_votes must be a number",
    });
  }

  return Promise.resolve(inc_votes);
};
