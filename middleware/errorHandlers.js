exports.handle404s = (req, res, next) => {
  res.status(404).send({ msg: "404 - Not Found: Endpoint does not exist" });
};

exports.handleSpecificErrors = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({
      msg: "400 - Bad Request: invalid_id",
    });
  } else if (err.code === "23502") {
    res.status(400).send({
      msg: "400 - Bad Request: Missing required fields",
    });
  } else if (err.code === "23503") {
    res.status(404).send({
      msg: "404 - Not Found: Article or User does not exist",
    });
  } else {
    next(err);
  }
};

exports.handleGenericErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(500).send({ msg: "Internal Server Error" });
  }
};
