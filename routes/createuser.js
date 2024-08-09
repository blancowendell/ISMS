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
    let username = req.body.username;
    let password = req.body.password;
    let status = "Active";
    let accesstype = "2";
    const createdate = GetCurrentDatetime();

    Encrypter(password, async (err, encrypted) => {
      if (err) {
        console.error("Error: ", err);
        res.json({ msg: "error" });
      } else {
        let sql = InsertStatement("master_user", "mu", [
          "studentid",
          "username",
          "password",
          "accesstype",
          "createdate",
          "status",
        ]);

        let data = [[studentid, username, encrypted, accesstype, createdate, status]];
        let checkStatement = SelectStatement(
          "select * from master_user where mu_studentid=? and mu_accesstype=?",
          [studentid, accesstype]
        );
        Check(checkStatement)
        .then((result) => {
          console.log(result);
          if (result != 0) {
            return res.json(JsonWarningResponse(MessageStatus.EXIST));
          } else {
            InsertTable(sql, data, (err, result) => {
              if (err) {
                console.log(err);
                res.json(JsonErrorResponse(err));
              }

              res.json(JsonSuccess());
            });
          }
        })
      .catch((error) => {
        console.log(error);
        res.json(JsonErrorResponse(error));
      });
      }
    });
  } catch (error) {
    console.error("Error: ", error);
    res.json({ msg: "error" });
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