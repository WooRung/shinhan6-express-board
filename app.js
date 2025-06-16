var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

const boardRouter = require("./routes/board");
const birdsRouter = require("./routes/birds");

const mongoose = require("mongoose");
const session = require("express-session");
const dotenv = require("dotenv");
dotenv.config();

const DB_URL = process.env.DB_URL;

mongoose
  .connect(DB_URL, {
    retryWrites: true,
    w: "majority",
    appName: "express-mongodb",
  })
  .then(() => {
    console.log("Connected Successful");
  })
  .catch((err) => {
    console.log(err);
  });

var app = express();

// // view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");
// app.disable("etag");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "<my-secret>",
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

// static file
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  console.log("미들웨어 실행");
  if (req.session.urlHistory) {
    req.session.urlHistory.push(req.url);
  } else {
    req.session.urlHistory = [req.url];
  }
  console.log(req.session.urlHistory);

  // next(): 다음 미들웨어 실행
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/board", boardRouter);
app.use("/birds", birdsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render("error");
  res.json(res.locals);
});

module.exports = app;
