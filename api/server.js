const app = require("../db/app.js");
const serverless = require("serverless-http");

module.exports = serverless(app);
