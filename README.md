# Northcoders News API

Northcoders News API is a backend service built to provide data programmatically, mimicking a real-world application like Reddit. The API is designed to interact with a PostgreSQL database using node-postgres and allows for various operations related to articles, comments, users, and topics.

## Background

The purpose of this project is to create an API that can be accessed programmatically for managing and retrieving data related to news articles, users, comments, and topics. This project shows how to build and structure a backend service similar to those used in real-world applications.

## Getting Started

Prerequisites

```
Node.js (https://nodejs.org/) (version 14.17.0 or higher)
PostgreSQL (https://www.postgresql.org/) (version 12 or higher)
```

## Installing

Clone the repository:

```
git clone https://github.com/filosoho/nc-news.git
```

```
cd your-repo-name
```

Install the dependencies:

```
npm install
```

Set up environment variables:

As .env.\* files are ignored by Git, you will need to create these files manually to set up the necessary environment variables for connecting to the databases.

Create the following files in the root of the project:

```
.env.development
PGDATABASE=database_name

.env.test
PGDATABASE=database_name_test
```

Ensure these `.env` files are listed in your `.gitignore` to prevent them from being pushed to GitHub.

**Run database setup and seed scripts:**

```
npm run setup-dbs
npm run seed
```

## API Endpoints

GET /api/topics

- Responds with a list of topics

GET /api

- Responds with a list of available endpoints

GET /api/articles/:article_id

- Responds with a single article by article_id

GET /api/articles

- Responds with a list of articles

GET /api/articles/:article_id/comments

- Responds with a list of comments by article_id

POST /api/articles/:article_id/comments

- Adds a comment by article_id

PATCH /api/articles/:article_id

- Updates an article by article_id

DELETE /api/comments/:comment_id

- Deletes a comment by comment_id

GET /api/users

- Responds with a list of users

GET /api/articles (queries)

- Allows articles to be filtered and sorted

GET /api/articles/:article_id (comment count)

- Adds a comment count to the response when retrieving a single article

## Running Tests

Run the automated tests with:

```
npm test
```

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
