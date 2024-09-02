var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { SetMongo } = require("./routes/controller/mongoose");
const cors = require("cors");



//var
var indexRouter = require("./routes/index");
var institutionsRouter = require("./routes/institutions");
var accessRouter = require("./routes/access");
var announcementsRouter = require("./routes/announcements");
var studentindexRouter = require("./routes/studentindex");
var loginRouter = require("./routes/login");
var landingpageRouter = require("./routes/landingpage");
var createuserRouter = require("./routes/createuser");
var adminloginRouter = require("./routes/adminlogin");
var adminusersRouter = require("./routes/adminusers");
var coursesRouter = require("./routes/courses");
var master_studentsRouter = require("./routes/master_student");
var studentprofileRouter = require("./routes/studentprofile");
var finishapplicationRouter = require("./routes/finishapplication");
var pendingapplicationRouter = require("./routes/pendingapplication");
var calendarRouter = require("./routes/calendar");
var questionsRouter = require("./routes/questions");
var scholarshipRouter = require("./routes/scholarship");
var approvedapplicationRouter = require("./routes/approvedapplication");
var testpermitRouter = require("./routes/testpermit");
var forgotpasswordRouter = require("./routes/forgotpassword");
var master_gradesRouter = require("./routes/master_grades");

var app = express();

SetMongo(app);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 500000 })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use(cors(corsOptions));


//app.use
app.use("/", indexRouter);
app.use("/institutions", institutionsRouter);
app.use("/access", accessRouter);
app.use("/announcements", announcementsRouter);
app.use("/studentindex", studentindexRouter);
app.use("/login", loginRouter);
app.use("/landingpage", landingpageRouter);
app.use("/createuser", createuserRouter);
app.use("/adminlogin", adminloginRouter);
app.use("/adminusers", adminusersRouter);
app.use("/courses", coursesRouter);
app.use("/master_student", master_studentsRouter);
app.use("/studentprofile", studentprofileRouter);
app.use("/finishapplication", finishapplicationRouter);
app.use("/pendingapplication", pendingapplicationRouter);
app.use("/calendar", calendarRouter);
app.use("/questions", questionsRouter);
app.use("/scholarship", scholarshipRouter);
app.use("/approvedapplication", approvedapplicationRouter);
app.use("/testpermit", testpermitRouter);
app.use("/forgotpassword", forgotpasswordRouter);
app.use("/master_grades", master_gradesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
  });
  
  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
  
    // // render the error page
    res.status(err.status || 500);
    res.render("error");
  });
  
  module.exports = app;
  