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
  Validator(req, res, "master_studentlayout");
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
        ms_institutionid AS ms_schoolname,
        ms_courseid AS ms_coursecode,
        ms_baranggay
        FROM master_students`;

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
        let sql = `SELECT
        *,
        CONCAT(ms_first_name,' ',ms_last_name) as ms_fullname,
        DATE_FORMAT(ms_registerdate, '%Y-%m-%d') AS ms_registerdate,
        s_name as ms_scholarname
        FROM master_students
        INNER JOIN scholarship ON master_students.ms_scholarshipid = s_scholarship_id
        WHERE ms_studentid = '${studentid}'`;

        console.log(sql);
        

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