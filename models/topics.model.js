const db = require("../db/connection.js");

exports.fetchTopics = () => {
  const queryStr = "SELECT * FROM topics;";
  return db.query(queryStr).then(({ rows: topics }) => {
    return topics;
  });
};

exports.addTopic = (topicData) => {
  const { slug, description } = topicData;

  if (!slug || !description) {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: Missing required fields",
    });
  }

  const allowedFields = ["slug", "description"];
  const fields = Object.keys(topicData);
  const invalidFields = fields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return Promise.reject({
      status: 400,
      msg: "400 - Bad Request: Invalid fields",
    });
  }

  const queryStr = `
    INSERT INTO topics (slug, description)
    VALUES ($1, $2)
    RETURNING *;
  `;

  return db.query(queryStr, [slug, description]).then(({ rows }) => {
    return rows[0];
  });
};
