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
    DATE_FORMAT(mq_createdate, '%Y-%m-%d %H:%i:%s') AS mq_createdate,
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
    let createdate = GetCurrentDatetime();

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

    let insertQuestionSql = `INSERT INTO master_questions (mq_description, mq_responseid, mq_createdate, mq_createby, mq_questionask) VALUES ('${question}', ${responseId}, '${createdate}', '${createdBy}', 0)`;
    await mysql.mysqlQueryPromise(insertQuestionSql, (err, result) => {
      if (err) {
        console.log(err);
        res.json(JsonErrorResponse(err));
        return;
      }
    });
    res.json(JsonSuccess());

  } catch (error) {
    res.json(JsonErrorResponse(error));
    console.log(error);
  }
});

router.post("/getquestions", (req, res) => {
  try {
    let questionid = req.body.questionid;

    let sql = `SELECT
    mq_description,
    mr_description as mq_answer
    FROM master_questions
    INNER JOIN master_response ON master_questions.mq_responseid = mr_responseid
    WHERE mq_questionid = '${questionid}'`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      console.log(result);

      if (result != 0) {
        let data = DataModeling(result, "mq_");

        //console.log(data);
        res.json(JsonDataResponse(data));
      } else {
        res.json(JsonDataResponse(result));
      }
    });
  } catch (error) {
    console.error(error);
    res.json(JsonErrorResponse(error))
  }
});

router.put('/edit', async (req, res) => {
  try {
    const { questiontext, questionanswer, questionid } = req.body;

    // Step 1: Check if the questionanswer exists in the master_response table
    const selectQuery = `SELECT mr_responseid FROM master_response WHERE mr_description = '${questionanswer}'`;
    let result = await mysql.mysqlQueryPromise(selectQuery);

    console.log(selectQuery);
    

    let responseId;

    if (result.length > 0) {
      // If the response exists, get the mr_responseid
      responseId = result[0].mr_responseid;
    } else {
      // If the response doesn't exist, insert a new one
      const insertQuery = `INSERT INTO master_response (mr_description) VALUES ('${questionanswer}')`;
      let insertResult = await mysql.mysqlQueryPromise(insertQuery);

      // Get the new mr_responseid
      responseId = insertResult.insertId;
      console.log(insertResult,'result');
      
      console.log(responseId,'responseid');
       // Change to insertId for MySQL insert
    }

    // Step 2: Update the master_questions table with the questiontext and mr_responseid
    const updateQuery = `
      UPDATE master_questions 
      SET mq_description = '${questiontext}', mq_responseid = ${responseId}, mq_createdate = NOW(), mq_createby = 'admin'
      WHERE mq_questionid = ${questionid}
    `;
    await mysql.mysqlQueryPromise(updateQuery);

    // Step 3: Return success response
    res.json({ msg: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'error', error: error.message });
  }
});

router.delete('/delete', async (req, res) => {
  const questionId = req.body.questionid; // Get question ID from request parameters

  try {
    // Step 1: Find the associated mr_responseid for the question
    const selectQuery = `SELECT mq_responseid FROM master_questions WHERE mq_questionid = ${questionId}`;
    const questionResult = await mysql.mysqlQueryPromise(selectQuery);

    if (questionResult.length === 0) {
      return res.status(404).json({ msg: 'Question not found' });
    }

    const responseId = questionResult[0].mq_responseid;

    // Step 2: Delete the question from master_questions
    const deleteQuestionQuery = `DELETE FROM master_questions WHERE mq_questionid = ${questionId}`;
    await mysql.mysqlQueryPromise(deleteQuestionQuery);

    // Step 3: Check if the response can be deleted (i.e., it has no other references)
    const responseCheckQuery = `SELECT COUNT(*) as count FROM master_questions WHERE mq_responseid = ${responseId}`;
    const responseCheckResult = await mysql.mysqlQueryPromise(responseCheckQuery);

    // If the count is 0, it means the response can be deleted
    if (responseCheckResult[0].count === 0) {
      const deleteResponseQuery = `DELETE FROM master_response WHERE mr_responseid = ${responseId}`;
      await mysql.mysqlQueryPromise(deleteResponseQuery);
    }

    // Step 4: Return success response
    res.json({ msg: 'Question and associated response deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'error', error: error.message });
  }
});