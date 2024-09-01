const mysql = require("./repository/ismsdb");
const moment = require('moment');
var express = require("express");
const { MessageStatus, JsonErrorResponse, JsonSuccess, JsonWarningResponse } = require("./repository/response");
const { SelectStatement, InsertStatement, GetCurrentDatetime } = require("./repository/customhelper");
const { InsertTable, Select } = require("./repository/dbconnect");
const { Encrypter } = require("./repository/crytography");
//const { Validator } = require("./controller/middleware");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("createuserlayout", { title: "Express" });
});

module.exports = router;



router.post("/save", async (req, res) => {
  try {
    const { studentid } = req.body;
    const username = req.body.username;
    const password = req.body.password;
    const status = "Active";
    const accesstype = "2";
    const createdate = GetCurrentDatetime();

    // Retrieve the email associated with the studentid
    const emailSql = SelectStatement(
      "SELECT ms_email FROM master_students WHERE ms_studentid = ?",
      [studentid]
    );

    const emailResult = await Check(emailSql);
    if (emailResult.length === 0) {
      // No email found for the given studentid
      return res.json(JsonWarningResponse(MessageStatus.NOTEXIST));
    }

    const email = emailResult[0].ms_email;

    // Encrypt the password
    Encrypter(password, async (err, encrypted) => {
      if (err) {
        console.error("Error: ", err);
        return res.json({ msg: "error" });
      }

      // Prepare the insert statement
      const insertSql = InsertStatement("master_user", "mu", [
        "studentid",
        "accesstypeid",
        "username",
        "password",
        "createdate",
        "status",
        "email"  // Adding email column to the insert statement
      ]);

      const data = [[studentid, accesstype, username, encrypted, createdate, status, email]];

      // Check if the user already exists
      const checkStatement = SelectStatement(
        "SELECT * FROM master_user WHERE mu_studentid = ?",
        [studentid]
      );

      try {
        const result = await Check(checkStatement);
        if (result.length > 0) {
          return res.json(JsonWarningResponse(MessageStatus.EXIST));
        }

        // Insert the new user
        InsertTable(insertSql, data, (err, result) => {
          if (err) {
            console.log(err);
            return res.json(JsonErrorResponse(err));
          }

          res.json(JsonSuccess());
        });
      } catch (error) {
        console.log(error);
        res.json(JsonErrorResponse(error));
      }
    });
  } catch (error) {
    console.error(error);
    res.json(JsonErrorResponse(error));
  }
});




//#region FUNCTION
function Check(sql) {
  return new Promise((resolve, reject) => {
    Select(sql, (err, result) => {
      if (err) reject(err);

      resolve(result);
    });
  });
}
//#endregion