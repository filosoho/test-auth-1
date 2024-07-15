const fs = require("fs").promises;
const path = require("path");

exports.getEndpoints = (req, res, next) => {
  const filePath = path.join(__dirname, "../endpoints.json");
  fs.readFile(filePath, "utf-8")
    .then((fileContent) => {
      const endpoints = JSON.parse(fileContent);
      res.status(200).send(endpoints);
    })
    .catch(next);
};
