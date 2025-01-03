const express = require("express");
const cors = require("cors");
const app = express();
const { getEndpoints } = require("../controllers/api.controller.js");
const articlesRouter = require("../routes/articles.js");
const commentsRouter = require("../routes/comments.js");
const usersRouter = require("../routes/users.js");
const topicsRouter = require("../routes/topics.js");
const {
  handle404s,
  handleSpecificErrors,
  handleGenericErrors,
} = require("../middleware/errorHandlers.js");

const allowedOrigins = [
  "http://localhost:5173",
  "https://fe-nc-news-gui8.onrender.com",
  "https://fanciful-sunshine-c9632c.netlify.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

app.use(express.json());

app.get("/api", getEndpoints);

app.use("/api/topics", topicsRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/users", usersRouter);

app.all("*", handle404s);
app.use(handleSpecificErrors);
app.use(handleGenericErrors);

module.exports = app;
