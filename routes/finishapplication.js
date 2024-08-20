const mysql = require("./repository/ismsdb");
//const moment = require('moment');
var express = require("express");
const { UserValidator } = require("./controller/middleware");
const { JsonErrorResponse, JsonSuccess, JsonWarningResponse, MessageStatus, JsonDataResponse } = require("./repository/response");
const { InsertTable, Select } = require("./repository/dbconnect");
const { SelectStatement, InsertStatement } = require("./repository/customhelper");
const { DataModeling } = require("./model/ismsdb");
var router = express.Router();
//const currentDate = moment();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("studentprofile");
  UserValidator(req, res, "finishapplicationlayout");
});

module.exports = router;


router.get("/load", function (req, res, next) {
  try {
    let studentid = req.session.studentid;
    let sql = `
    SELECT * FROM master_students_request
    WHERE msr_studentid = '${studentid}' AND msr_status = 'Applied'`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      console.log(result);

      if (result.length > 0) {  // Check if the result length is greater than 0
        let data = DataModeling(result, "msr_");
        console.log(data);
        res.json({
          status: "exists",    // Indicate that the record exists
          data: JsonDataResponse(data)
        });
      } else {
        res.json({
          status: "not_found", // Indicate that no record was found
          data: JsonDataResponse(result)
        });
      }
    });
  } catch (error) {
    res.json(JsonErrorResponse(error));
  }
});



router.post("/loadexistingrecord", (req, res) => {
    try {
      let studentid = req.body.studentid;
      let sql = `SELECT 
        *,
        DATE_FORMAT(ms_date_of_birth, '%Y-%m-%d') AS ms_date_of_birth,
        DATE_FORMAT(ms_registerdate, '%Y-%m-%d') AS ms_registerdate
      FROM master_students
      WHERE ms_studentid = '${studentid}'`;
  
      Select(sql, (err, result) => {
        if (err) {
          console.error(err);
          res.json(JsonErrorResponse(err));
        }
  
        console.log(result);
  
        if (result != 0) {
          let data = DataModeling(result, "ms_");
  
          console.log(data);
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
  

  router.post("/save", function (req, res, next) {
    try {
      const {
        studentid,
        first_name,
        middle_name,
        last_name,
        dob,
        birthplace,
        phone,
        gender,
        age,
        school_name,
        course_strand,
        year_level,
        academic_status,
        register_date,
        city,
        barangay,
        village,
        street_address,
        houseno,
        fathersname,
        fathersmonthly,
        fathersoccupation,
        mothersname,
        mothersoccupation,
        mothersmonthly,
        imageFile,
        imageFileGradeCopy,
        imageFileRegForm,
        imageFileCertRes,
        imageFileItr,
        imageFileNfi,
      } = req.body;
      let scholar_status = 'Applied';

      // Update the InsertStatement to include the new columns for files
      let sql = InsertStatement("master_students_request", "msr", [
        "studentid",
        "image",
        "first_name",
        "middle_name",
        "last_name",
        "date_of_birth",
        "birthplace",
        "phone",
        "gender",
        "age",
        "status",
        "institutionid",
        "courseid",
        "yearlevel",
        "academic_status",
        "registerdate",
        "city",
        "baranggay",
        "village",
        "street",
        "house_no",
        "fathers_name",
        "fathers_salary",
        "fathers_occupation",
        "mothers_name",
        "mothers_occupation",
        "mothers_salary",
        "grade_copy",              // New field
        "registration_form",       // New field
        "certificate_residency",   // New field
        "itr",                     // New field
        "nfi"                      // New field
      ]);
  
      // Update the data array to include the new Base64 fields
      let data = [
        [
          studentid,
          imageFile,
          first_name,
          middle_name,
          last_name,
          dob,
          birthplace,
          phone,
          gender,
          age,
          scholar_status,
          school_name,
          course_strand,
          year_level,
          academic_status,
          register_date,
          city,
          barangay,
          village,
          street_address,
          houseno,
          fathersname,
          fathersmonthly,
          fathersoccupation,
          mothersname,
          mothersoccupation,
          mothersmonthly,
          imageFileGradeCopy,
          imageFileRegForm,
          imageFileCertRes,
          imageFileItr,
          imageFileNfi,
        ],
      ];
      
  
      let checkStatement = SelectStatement(
        "select * from master_students_request where msr_studentid=? and msr_status=?",
        [studentid, scholar_status]
      );
  
      Check(checkStatement)
        .then((result) => {
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
    } catch (error) {
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
