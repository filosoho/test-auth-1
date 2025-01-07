const { Pool } = require("pg");
const ENV = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: `${__dirname}/../.env.${ENV}`,
});

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE or DATABASE_URL not set");
}

const config = {};

if (ENV === "production") {
  config.connectionString = process.env.DATABASE_URL;
  config.ssl = { rejectUnauthorized: false };
  config.max = 2;
}
console.log("Environment:", ENV);
console.log("Database:", process.env.PGDATABASE);
console.log("Database URL:", process.env.DATABASE_URL);

module.exports = new Pool(config);
