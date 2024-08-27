const mysql = require("./repository/ismsdb");
//const moment = require('moment');
var express = require("express");
const { UserValidator } = require("./controller/middleware");
const { Select } = require("./repository/dbconnect");
const { DataModeling } = require("./model/ismsdb");
const { JsonDataResponse, JsonErrorResponse } = require("./repository/response");
var router = express.Router();
//const currentDate = moment();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("studentprofile");
  UserValidator(req, res, "studentprofilelayout");
});

module.exports = router;


router.get("/studentprofileload", function (req, res, next) {
  try {
    let studentid = req.session.studentid;
    let sql = `      SELECT 
      *,
      DATE_FORMAT(ms_date_of_birth, '%Y-%m-%d') AS ms_date_of_birth,
      DATE_FORMAT(ms_registerdate, '%Y-%m-%d') AS ms_registerdate,
      s_name as ms_scholarshipid
    FROM master_students
    INNER JOIN scholarship ON master_students.ms_scholarshipid = s_scholarship_id
    WHERE ms_studentid = '${studentid}' AND ms_status = 'Verified'`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      //console.log(result);

      if (result != 0) {
        let data = DataModeling(result, "ms_");

        //console.log(data);
        res.json(JsonDataResponse(data));
      } else {
        res.json(JsonDataResponse(result));
      }
    });
  } catch (error) {
    console.error(error);
    res.json(JsonErrorResponse(error));
  }
});