const request = require("supertest");
const app = require("../db/app.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const db = require("../db/connection.js");
const fs = require("fs").promises;
const path = require("path");

beforeAll(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("/api", () => {
  describe("GET", () => {
    test("GET 200: responds with a json representation of all available endpoints", () => {
      const filePath = path.join(__dirname, "../endpoints.json");
      return request(app)
        .get("/api")
        .expect(200)
        .then((response) => {
          return fs.readFile(filePath, "utf-8").then((fileContent) => {
            const expectedEndpoints = JSON.parse(fileContent);
            expect(response.body).toEqual(expectedEndpoints);
          });
        });
    });
  });
});

describe("/api/topics", () => {
  describe("GET", () => {
    test("GET 200: responds with status 200 and an array of topic objects", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body: { topics } }) => {
          expect(Array.isArray(topics)).toBe(true);
          expect(topics.length).toBe(3);
          topics.forEach((topic) => {
            expect(topic).toHaveProperty("slug");
            expect(topic).toHaveProperty("description");
            expect(typeof topic.slug).toBe("string");
            expect(typeof topic.description).toBe("string");
          });
        });
    });
    test("GET 404: /api/nonexistent-route returns 404 - Not Found: Endpoint does not exist", () => {
      return request(app)
        .get("/api/nonexistent-route")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("404 - Not Found: Endpoint does not exist");
        });
    });
  });
});

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    test("GET 200: responds with status 200 and the article object", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("body");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
        });
    });
    test("GET 200: validates types of the article object properties", () => {
      let id = 1;
      return request(app)
        .get(`/api/articles/${id}`)
        .expect(200)
        .then(({ body: { article } }) => {
          expect(typeof article.article_id).toBe("number");
          expect(article).toEqual({
            article_id: id,
            author: expect.any(String),
            title: expect.any(String),
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          });
          expect(Date.parse(article.created_at)).not.toBeNaN();
          expect(Date.parse(article.created_at)).toBe(1594325460000); // Unix timestamp from 2020-07-09T20:11:00.000Z is 1594325460000 - number of milliseconds since January 1, 1970, 00:00:00 UTC // Source https://www.timestamp-converter.com/
        });
    });
    test("GET 200: responds with the correct article object", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toEqual({
            article_id: 1,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            title: "Living in the shadow of a great man",
            topic: "mitch",
            votes: 100,
          });
        });
    });

    test("GET 400: responds with status 400 for an invalid article_id", () => {
      return request(app)
        .get("/api/articles/invalid_id")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("400 - Bad Request: Invalid article_id");
        });
    });

    test("GET 404: responds with status 404 for a non-existent article_id", () => {
      return request(app)
        .get("/api/articles/9999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("404 - Not Found: Article not found");
        });
    });
  });
});
