const mysql = require("./repository/ismsdb");
//const moment = require('moment');
var express = require("express");
const { UserValidator } = require("./controller/middleware");
const { JsonErrorResponse, JsonSuccess, JsonWarningResponse, MessageStatus, JsonDataResponse } = require("./repository/response");
const { InsertTable, Select } = require("./repository/dbconnect");
const { SelectStatement, InsertStatement, GetCurrentDatetime } = require("./repository/customhelper");
const { DataModeling } = require("./model/ismsdb");
var router = express.Router();
const nodemailer = require('nodemailer'); // Make sure to require nodemailer
//const currentDate = moment();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("studentprofile");
  UserValidator(req, res, "questionslayout");
});

module.exports = router;


router.get("/load", (req, res) => {
  try {
    let sql = `
    SELECT
    mq_questionid,
    mq_description,
    mr_description as mq_responseid,
    mq_createdate,
    mq_createby
    FROM master_questions
    INNER JOIN master_response ON master_questions.mq_responseid = mr_responseid`;

    Select(sql, (err, result) => { 
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }
    
      console.log(result);
    
      if (result != 0) {
        let data = DataModeling(result, "mq_");
    
        console.log(data);
        res.json(JsonDataResponse(data));
      } else {
        res.json(JsonDataResponse(result));
      }
    });
  } catch (error) {
    res.json(JsonErrorResponse(error));
  }
});


// Helper function to query the database with promises
function queryAsync(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
}



router.post("/save", async (req, res) => {
  try {
    let question = req.body.question;
    let response = req.body.response;
    let createdBy = req.session.fullname; // Get current datetime

    // Insert response into master_response table
    let insertResponseSql = `INSERT INTO master_response (mr_description) VALUES ('${response}')`;
    let responseInsertResult = await mysql.mysqlQueryPromise(insertResponseSql, (err, result) => {
      if (err) {
        console.log(err);
        res.json(JsonErrorResponse(err));
        return;
      }
    });
    let responseId = responseInsertResult.insertId;

    let insertQuestionSql = `INSERT INTO master_questions (mq_description, mq_responseid, mq_createdate, mq_createby, mq_questionask) VALUES ('${question}', ${responseId}, '${createdBy}', '${createdBy}', 0)`;
    await mysql.mysqlQueryPromise(insertQuestionSql, (err, result) => {
      if (err) {
        console.log(err);
        res.json(JsonErrorResponse(err));
        return;
      }
    });

    // Send success response
    res.json(JsonSuccess());

  } catch (error) {
    // Send error response if something goes wrong
    res.json(JsonErrorResponse(error));
    console.log(error);
  }
});
// router.post("/save", async (req, res) => {
//   try {
//     let question = req.body.question;
//     let response = req.body.response;
//     let createdBy = GetCurrentDatetime();

//     let data = [
//       [
//         response,
//       ],
//     ];

//     let sql = InsertStatement("master_response", "mr", [
//       "description",
//     ]);

//     InsertTable(sql, data, (err, result) => {
//       if (err) {
//         console.log(err);
//         res.json(JsonErrorResponse(err));
//       }

//       res.json(JsonSuccess());
//     });
    
//     let responseId = responseInsertResult.insertId;

//     let lastInsert = InsertStatement("master_questions", "mq", [
//       "description",
//       "responseid",
//       "createdate",
//       "createby",
//       "questionask",
//     ]);

//     let lasstdata = [
//       [
//         question,
//         responseId,
//         createdBy,
//         0,
//       ],
//     ];

//     InsertTable(lastInsert, lasstdata, (err, result) => {
//       if (err) {
//         console.log(err);
//         res.json(JsonErrorResponse(err));
//       }

//       res.json(JsonSuccess());
//     });

//     res.json(JsonSuccess());

//   } catch (error) {
//     res.json(JsonErrorResponse(error));
//   }
// });
