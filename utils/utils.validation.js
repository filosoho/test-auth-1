exports.validateArticleId = (article_id) => {
  const articleId = Number(article_id);
  if (isNaN(articleId)) {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: Invalid article_id",
    });
  }
  return Promise.resolve(articleId);
};

exports.validateUsername = (username) => {
  if (username === undefined) {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: Missing username or body in request body",
    });
  }
  if (typeof username !== "string") {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: username must be a string",
    });
  }
  return Promise.resolve(username);
};

exports.validateCommentBody = (body) => {
  if (body === undefined) {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: Missing username or body in request body",
    });
  }
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
  return Promise.resolve(body);
};

exports.validateIncVotes = (inc_votes) => {
  if (inc_votes === undefined) {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: Missing inc_votes in request body",
    });
  }
  if (typeof inc_votes !== "number") {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: inc_votes must be a number",
    });
  }

  return Promise.resolve(inc_votes);
};
