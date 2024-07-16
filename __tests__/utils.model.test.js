const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const db = require("../db/connection.js");
const { articleExists } = require("../models/utils.model.js");

beforeAll(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("Tests for utils.model.js", () => {
  test("should return true if the article exists", () => {
    return articleExists(1).then((exists) => {
      expect(exists).toBe(true);
    });
  });
  test("should return false if the article does not exist", () => {
    return articleExists(9999).then((exists) => {
      expect(exists).toBe(false);
    });
  });
  test("should handle invalid article_id and reject the promise", () => {
    return articleExists("invalid_id").catch((err) => {
      expect(err).toBeDefined();
      expect(err).toHaveProperty("code", "22P02");
    });
  });
});
