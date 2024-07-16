const request = require("supertest");
const app = require("../db/app.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const db = require("../db/connection.js");
const fs = require("fs").promises;
const path = require("path");
const jestSorted = require("jest-sorted");

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

describe("/api/articles", () => {
  describe("GET", () => {
    test("GET 200: responds with status 200 and an array of article objects without a body property sorted by date in descending order", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBeGreaterThan(0);
          articles.forEach((article) => {
            expect(article).toHaveProperty("author");
            expect(article).toHaveProperty("title");
            expect(article).toHaveProperty("article_id");
            expect(article).toHaveProperty("topic");
            expect(article).toHaveProperty("created_at");
            expect(article).toHaveProperty("votes");
            expect(article).toHaveProperty("article_img_url");
            expect(article).toHaveProperty("comment_count");
            expect(article).not.toHaveProperty("body");
          });
        });
    });
    test("GET 200: responds with articles sorted by created_at in descending order", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("GET 200: validates types of the article object properties without the body property", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBeGreaterThan(0);
          articles.forEach((article) => {
            expect(article).toEqual(
              expect.objectContaining({
                article_id: expect.any(Number),
                author: expect.any(String),
                title: expect.any(String),
                topic: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                article_img_url: expect.any(String),
              })
            );
          });
        });
    });
    test("GET 200: validates `created_at` field is a valid ISO 8601 date string", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          articles.forEach((article) => {
            expect(Date.parse(article.created_at)).not.toBeNaN();
            const date = new Date(article.created_at);
            expect(date.toISOString()).toBe(article.created_at);
          });
        });
    });
  });
});

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
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

describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    test("GET 200: responds with status 200 and an array of comments for the given article_id", () => {
      return request(app)
        .get(`/api/articles/1/comments`)
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBeGreaterThan(0);
          comments.forEach((comment) => {
            expect(comment).toHaveProperty("comment_id");
            expect(comment).toHaveProperty("votes");
            expect(comment).toHaveProperty("created_at");
            expect(comment).toHaveProperty("author");
            expect(comment).toHaveProperty("body");
            expect(comment).toHaveProperty("article_id");
          });
        });
    });
    test("fetchCommentsByArticleId: ensures comments are sorted by created_at in descending order", () => {
      return request(app)
        .get(`/api/articles/1/comments`)
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
    test("GET 200: responds with an empty array if article_id exists but has no comments", () => {
      return request(app)
        .get(`/api/articles/2/comments`)
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(0);
          expect(comments).toEqual([]);
        });
    });
    test("GET 200: responds with comments for a valid article_id, including comments with future dates", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                body: "I hate streaming eyes even more",
              }),
              expect.objectContaining({ body: "Superficially charming" }),
            ])
          );
        });
    });
    test("GET 200: responds with comments for a valid article_id, including comments with past dates", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
              }),
              expect.objectContaining({
                body: "I hate streaming noses",
              }),
            ])
          );
        });
    });

    test("GET 404: responds with status 404 and Article not found message for an invalid article_id", () => {
      return request(app)
        .get(`/api/articles/9999/comments`)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("404 - Not Found: Article not found");
        });
    });
    test("GET 400: responds with status 400 and Bad Request message for an invalid article_id syntax", () => {
      return request(app)
        .get("/api/articles/invalid_id/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("400 - Bad Request: Invalid article_id");
        });
    });
  });
});
