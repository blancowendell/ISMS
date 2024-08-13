var express = require("express");
const {
  JsonErrorResponse,
  JsonDataResponse,
  JsonWarningResponse,
  JsonSuccess,
  MessageStatus,
} = require("./repository/response");
const { Select, Update, InsertTable } = require("./repository/dbconnect");
const { GetValue, ACT, INACT } = require("./repository/dictionary");
const {
  GetCurrentDatetime,
  SelectStatement,
  InsertStatement,
  UpdateStatement,
} = require("./repository/customhelper");
const { DataModeling } = require("./model/ismsdb");
const { Validator } = require("./controller/middleware");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  Validator(req, res, "studentslayout");
  //res.render('institutionslayout', { title: 'Express' });
});

module.exports = router;


router.get("/load", (req, res) => {
    try {
        let sql = `SELECT
        ms_studentid,
        CONCAT(ms_last_name,' ',ms_first_name) AS ms_fullname,
        ms_phone,
        ms_email,
        ms_status,
        mi_name AS ms_schoolname,
        mc_name_code AS ms_coursecode,
        ms_baranggay
        FROM master_students
        INNER JOIN master_institutions ON master_students.ms_institutionid = mi_institutionsid
        INNER JOIN master_courses ON master_students.ms_courseid = mc_course_id`;

        Select(sql, (err, result) => {
            if (err) {
              console.error(err);
              res.json(JsonErrorResponse(err));
            }
      
            console.log(result);
      
            if (result != 0) {
              let data = DataModeling(result, "ms_");
      
              //console.log(data);
              res.json(JsonDataResponse(data));
            } else {
              res.json(JsonDataResponse(result));
            }
          });
    } catch (error) {
        res.json(JsonErrorResponse(error));
    }
});


router.post("/getstudents", (req, res) => {
    try {
        let studentid = req.body.studentid;
        let sql = `SELECT * FROM master_students
        WHERE ms_studentid = ${studentid}`;

        Select(sql, (err, result) => {
            if (err) {
              console.error(err);
              res.json(JsonErrorResponse(err));
            }
      
            console.log(result);
      
            if (result != 0) {
              let data = DataModeling(result, "ms_");
      
              //console.log(data);
              res.json(JsonDataResponse(data));
            } else {
              res.json(JsonDataResponse(result));
            }
          });
    } catch (error) {
        res.json(JsonErrorResponse(error));
    }
});