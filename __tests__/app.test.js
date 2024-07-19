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
    test("GET 200: validates created_at field is a valid ISO 8601 date string", () => {
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

    test("GET 200: ?sort_by=created_at&order=asc returns articles sorted by created_at in ascending order", () => {
      return request(app)
        .get("/api/articles?sort_by=created_at&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBeGreaterThan(0);
          expect(body.articles).toBeSortedBy("created_at", {
            descending: false,
          });
        });
    });

    test("GET 200: check if articles are sorted by created_at in ascending order", () => {
      return request(app)
        .get("/api/articles?sort_by=created_at&order=asc")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBeGreaterThan(0);
          for (let i = 0; i < articles.length - 1; i++) {
            const currentArticleTime = new Date(
              articles[i].created_at
            ).getTime();
            const nextArticleTime = new Date(
              articles[i + 1].created_at
            ).getTime();
            expect(currentArticleTime).toBeLessThanOrEqual(nextArticleTime);
          }
        });
    });

    test("GET 200: ?sort_by=votes&order=desc returns articles sorted by votes in descending order", () => {
      return request(app)
        .get("/api/articles?sort_by=votes&order=desc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBeGreaterThan(0);
          expect(body.articles).toBeSortedBy("votes", { descending: true });
        });
    });

    test("GET 200: ?sort_by=comment_count&order=asc returns articles sorted by comment_count in ascending order", () => {
      return request(app)
        .get("/api/articles?sort_by=comment_count&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBeGreaterThan(0);
          expect(body.articles).toBeSortedBy("comment_count", {
            descending: false,
          });
        });
    });

    test("GET 200: responds with articles filtered by topic", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBeGreaterThan(0);
          body.articles.forEach((article) => {
            expect(article.topic).toBe("cats");
          });
        });
    });

    test("GET 200: filters articles by author", () => {
      return request(app)
        .get("/api/articles?author=butter_bridge")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBeGreaterThan(0);
          articles.forEach((article) => {
            expect(article.author).toBe("butter_bridge");
          });
        });
    });

    test("GET 200: ?sort_by=&order= returns 200 and defaults sort_by to created_at and order query to descending", () => {
      return request(app)
        .get("/api/articles?sort_by=&order=")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBeGreaterThan(0);
          expect(body.articles).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });

    test("GET 200: returns an empty array when the topic exists but has no articles", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toEqual([]);
        });
    });

    test("GET 400: ?sort_by=invalid_column returns 400 error for invalid sort_by column", () => {
      return request(app)
        .get("/api/articles?sort_by=invalid_column")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "400 - Bad Request: Invalid sort_by or order query parameter"
          );
        });
    });

    test("GET 400: ?order=invalid_order returns 400 error for invalid order value", () => {
      return request(app)
        .get("/api/articles?order=invalid_order")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "400 - Bad Request: Invalid sort_by or order query parameter"
          );
        });
    });

    test("GET 404: responds with 404 for non-existent topic", () => {
      return request(app)
        .get("/api/articles?topic=non_existent_topic")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("404 - Not Found: Topic not found");
        });
    });

    test("GET 404: responds with 404 for non-existent author", () => {
      return request(app)
        .get("/api/articles?author=non_existent_author")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("404 - Not Found: Author not found");
        });
    });

    test("GET 400: responds with 400 if topic value missing", () => {
      return request(app)
        .get("/api/articles?topic=")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "400 - Bad Request: Topic or Author value missing"
          );
        });
    });

    test("GET 400: responds with 400 if author value missing", () => {
      return request(app)
        .get("/api/articles?author=")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "400 - Bad Request: Topic or Author value missing"
          );
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
            comment_count: 11,
          });
        });
    });

    test("GET 200: responds with an article object including comment_count", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toMatchObject({
            article_id: 1,
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
    });

    test("GET 400: responds with status 400 for an invalid article_id", () => {
      return request(app)
        .get("/api/articles/invalid_id")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("400 - Bad Request: invalid_id");
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

  describe("PATCH", () => {
    test("PATCH 200: validates types of the article object properties when successfully updated the votes of an article", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: 1 })
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toMatchObject({
            article_id: 1,
            votes: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
          });
        });
    });
    test("PATCH 200: successfully updates the article votes by 1", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body: { article: originalArticle } }) => {
          return request(app)
            .patch("/api/articles/1")
            .send({ inc_votes: 1 })
            .expect(200)
            .then(({ body: { article } }) => {
              expect(article).toMatchObject({
                article_id: 1,
                votes: expect.any(Number),
              });

              return request(app)
                .get("/api/articles/1")
                .expect(200)
                .then(({ body: { article: updatedArticle } }) => {
                  expect(updatedArticle.votes).toBe(originalArticle.votes + 1);
                });
            });
        });
    });
    test("PATCH 200: successfully updates the article votes by -100", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body: { article: originalArticle } }) => {
          return request(app)
            .patch("/api/articles/1")
            .send({ inc_votes: -100 })
            .expect(200)
            .then(({ body: { article } }) => {
              expect(article).toMatchObject({
                article_id: 1,
                votes: expect.any(Number),
              });

              return request(app)
                .get("/api/articles/1")
                .expect(200)
                .then(({ body: { article: updatedArticle } }) => {
                  expect(updatedArticle.votes).toBe(
                    originalArticle.votes - 100
                  );
                });
            });
        });
    });

    test("PATCH 400: responds with an error for invalid article_id", () => {
      return request(app)
        .patch("/api/articles/not-a-number")
        .send({ inc_votes: 1 })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("400 - Bad Request: invalid_id");
        });
    });

    test("PATCH 400: responds with an error for invalid inc_votes", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: "not-a-number" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("400 - Bad Request: inc_votes must be a number");
        });
    });

    test("PATCH 404: responds with an error for non-existent article_id", () => {
      return request(app)
        .patch("/api/articles/9999")
        .send({ inc_votes: 1 })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("404 - Not Found: Article not found");
        });
    });

    test("PATCH 400: responds with an error when inc_votes is missing in request body", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({})
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("400 - Bad Request: inc_votes must be a number");
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
    test("GET 200: each comment should have valid property types", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          comments.forEach((comment) => {
            expect(comment).toEqual(
              expect.objectContaining({
                comment_id: expect.any(Number),
                votes: expect.any(Number),
                created_at: expect.any(String),
                author: expect.any(String),
                body: expect.any(String),
                article_id: expect.any(Number),
              })
            );

            expect(new Date(comment.created_at).toString()).not.toBe(
              "Invalid Date"
            );
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
          expect(body.msg).toBe("400 - Bad Request: invalid_id");
        });
    });
  });

  describe("POST", () => {
    test("POST 201: successfully adds a comment for a valid article_id", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({
          username: "butter_bridge",
          body: "This is a new comment!",
        })
        .expect(201)
        .then(({ body: { comment } }) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: 0,
            created_at: expect.any(String),
            author: "butter_bridge",
            body: "This is a new comment!",
            article_id: 1,
          });

          expect(new Date(comment.created_at).toString()).not.toBe(
            "Invalid Date"
          );
        });
    });

    test("POST 400: responds with an error if username is missing", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ body: "This is a new comment!" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("400 - Bad Request: Missing required fields");
        });
    });

    test("POST 400: responds with an error if body is missing", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ username: "butter_bridge" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("400 - Bad Request: Missing required fields");
        });
    });

    test("POST 400: responds with an error if body is an empty string", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ username: "butter_bridge", body: "" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("400 - Bad Request: Comment body cannot be empty");
        });
    });
    test("POST 404: responds with an error for non-existent article_id", () => {
      return request(app)
        .post("/api/articles/999/comments")
        .send({
          username: "butter_bridge",
          body: "This is a new comment!",
        })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("404 - Not Found: Article or User does not exist");
        });
    });

    test("POST 404: responds with an error for non-existent username", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({
          username: "non_existent_user",
          body: "This is a new comment!",
        })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("404 - Not Found: Article or User does not exist");
        });
    });

    test("POST 400: responds with an error for non-numeric article_id", () => {
      return request(app)
        .post("/api/articles/invalid_id/comments")
        .send({
          username: "butter_bridge",
          body: "This is a new comment!",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("400 - Bad Request: invalid_id");
        });
    });

    test("POST 400: responds with an error for invalid username data type", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({
          username: 12345,
          body: "This is a new comment!",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("400 - Bad Request: username must be a string");
        });
    });

    test("POST 400: responds with an error for invalid body data type", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({
          username: "butter_bridge",
          body: 12345,
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("400 - Bad Request: body must be a string");
        });
    });
  });
});

describe("/api/comments/:comment_id", () => {
  describe("GET", () => {
    describe("/api/comments/:comment_id", () => {
      test("GET 200: responds with a comment object when given a valid comment_id", () => {
        return request(app)
          .get("/api/comments/1")
          .expect(200)
          .then(({ body }) => {
            expect(body.comment).toEqual({
              comment_id: 1,
              body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
              article_id: 9,
              author: "butter_bridge",
              votes: expect.any(Number),
              created_at: "2020-04-06T12:17:00.000Z",
            });
          });
      });

      test("GET 404: responds with an error when given a non-existent comment_id", () => {
        return request(app)
          .get("/api/comments/9999")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("404 - Not Found: Comment not found");
          });
      });

      test("GET 400: responds with an error when given an invalid comment_id", () => {
        return request(app)
          .get("/api/comments/invalid_id")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("400 - Bad Request: invalid_id");
          });
      });
    });
  });

  describe("PATCH", () => {
    test("PATCH 200: returns an object with a requested comment_id and valid property types", () => {
      return request(app)
        .patch("/api/comments/1")
        .send({ inc_votes: 1 })
        .expect(200)
        .then(({ body }) => {
          expect(body.comment).toEqual({
            comment_id: 1,
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
    });

    test("PATCH 200: updates votes for a comment successfully by a positive number", () => {
      return request(app)
        .get("/api/comments/1")
        .expect(200)
        .then(({ body }) => {
          const {
            comment: { votes: originalVotes },
          } = body;
          expect(originalVotes).toBeDefined();
          expect(originalVotes).toBe(17);
          return request(app)
            .patch("/api/comments/1")
            .send({ inc_votes: 1 })
            .expect(200)
            .then(({ body }) => {
              const { comment: updatedComment } = body;
              expect(updatedComment).toEqual({
                comment_id: 1,
                body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                article_id: 9,
                author: "butter_bridge",
                votes: originalVotes + 1,
                created_at: "2020-04-06T12:17:00.000Z",
              });
            });
        });
    });

    test("PATCH 200: updates votes for a comment successfully by a negative number", () => {
      return request(app)
        .get("/api/comments/1")
        .expect(200)
        .then(({ body }) => {
          const {
            comment: { votes: originalVotes },
          } = body;
          expect(originalVotes).toBeDefined();
          expect(originalVotes).toBe(18);
          return request(app)
            .patch("/api/comments/1")
            .send({ inc_votes: -10 })
            .expect(200)
            .then(({ body }) => {
              const { comment: updatedComment } = body;
              expect(updatedComment).toEqual({
                comment_id: 1,
                body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                article_id: 9,
                author: "butter_bridge",
                votes: originalVotes - 10,
                created_at: "2020-04-06T12:17:00.000Z",
              });
            });
        });
    });

    test("PATCH 404: responds with an error when given a non-existent comment_id", () => {
      return request(app)
        .patch("/api/comments/99087")
        .send({ inc_votes: 1 })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("404 - Not Found: Comment not found");
        });
    });

    test("PATCH 400: responds with an error when given not a valid comment_id", () => {
      return request(app)
        .patch("/api/comments/not-valid-comment_id")
        .send({ inc_votes: 1 })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("400 - Bad Request: invalid_id");
        });
    });

    test("PATCH 400: responds with an error when the request body is invalid", () => {
      return request(app)
        .patch("/api/comments/1")
        .send({ invalid_key: 1 })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("400 - Bad Request: Missing required fields");
        });
    });

    test("PATCH 400: responds with an error when inc_votes is not a number", () => {
      return request(app)
        .patch("/api/comments/1")
        .send({ inc_votes: "string" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("400 - Bad Request: invalid_id");
        });
    });
  });

  describe("DELETE", () => {
    test("204: successfully deletes the comment and returns no content", () => {
      return request(app)
        .delete("/api/comments/1")
        .expect(204)
        .then(({ body }) => {
          return db.query("SELECT * FROM comments WHERE comment_id = 1");
        })
        .then(({ rows }) => {
          expect(rows.length).toBe(0);
        });
    });

    test("404: responds with an error when trying to delete a non-existent comment", () => {
      return request(app)
        .delete("/api/comments/9999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("404 - Not Found: Comment not found");
        });
    });

    test("400: responds with an error when comment_id is invalid", () => {
      return request(app)
        .delete("/api/comments/invalid_id")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("400 - Bad Request: invalid_id");
        });
    });

    test("404: responds with an error when comment_id is missing", () => {
      return request(app)
        .delete("/api/comments/")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("404 - Not Found: Endpoint does not exist");
        });
    });
  });
});

describe("/api/users", () => {
  describe("GET", () => {
    test("200: responds with an array of user objects and checks their property type", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          expect(body.users.length).toBeGreaterThan(0);
          body.users.forEach((user) => {
            expect(user).toEqual({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });
  });
});

describe("/api/users/:username", () => {
  test("GET 200: responds with a user object when given a valid username", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toEqual({
          username: "butter_bridge",
          avatar_url: expect.any(String),
          name: "jonny",
        });
      });
  });

  test("GET 404: responds with an error when given a non-existent username", () => {
    return request(app)
      .get("/api/users/non_existent_user")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404 - Not Found: User not found");
      });
  });
});
