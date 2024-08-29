const mysql = require("./repository/ismsdb");
//const moment = require('moment');
var express = require("express");
const { UserValidator } = require("./controller/middleware");
const { JsonErrorResponse, JsonSuccess, JsonWarningResponse, MessageStatus, JsonDataResponse } = require("./repository/response");
const { InsertTable, Select, Update } = require("./repository/dbconnect");
const { SelectStatement, InsertStatement, UpdateStatement } = require("./repository/customhelper");
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
        DATE_FORMAT(msr_date_of_birth, '%Y-%m-%d') AS msr_date_of_birth,
        DATE_FORMAT(msr_registerdate, '%Y-%m-%d') AS msr_registerdate
      FROM master_students_request
      WHERE msr_studentid = '${studentid}' AND msr_status = 'Applied'`;
  
      Select(sql, (err, result) => {
        if (err) {
          console.error(err);
          res.json(JsonErrorResponse(err));
        }
  
        //console.log(result);
  
        if (result != 0) {
          let data = DataModeling(result, "msr_");
  
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
      scholarshipid,
    } = req.body;

    console.log(studentid,'id');
    
    
    let scholar_status = 'Applied';

    let data = [];
    let columns = [];
    let arguments = [];

    if (first_name) {
      data.push(first_name);
      columns.push("first_name");
    }

    if (middle_name) {
      data.push(middle_name);
      columns.push("middle_name");
    }

    if (last_name) {
      data.push(last_name);
      columns.push("last_name");
    }

    if (dob) {
      data.push(dob);
      columns.push("date_of_birth");
    }

    if (birthplace) {
      data.push(birthplace);
      columns.push("birthplace");
    }

    if (phone) {
      data.push(phone);
      columns.push("phone");
    }

    if (gender) {
      data.push(gender);
      columns.push("gender");
    }

    if (age) {
      data.push(age);
      columns.push("age");
    }

    if (school_name) {
      data.push(school_name);
      columns.push("institutionid");
    }

    if (course_strand) {
      data.push(course_strand);
      columns.push("courseid");
    }

    if (year_level) {
      data.push(year_level);
      columns.push("yearlevel");
    }

    if (academic_status) {
      data.push(academic_status);
      columns.push("academic_status");
    }

    if (register_date) {
      data.push(register_date);
      columns.push("registerdate");
    }

    if (city) {
      data.push(city);
      columns.push("city");
    }

    if (barangay) {
      data.push(barangay);
      columns.push("baranggay");
    }

    if (village) {
      data.push(village);
      columns.push("village");
    }

    if (street_address) {
      data.push(street_address);
      columns.push("street");
    }

    if (houseno) {
      data.push(houseno);
      columns.push("house_no");
    }

    if (fathersname) {
      data.push(fathersname);
      columns.push("fathers_name");
    }

    if (fathersmonthly) {
      data.push(fathersmonthly);
      columns.push("fathers_salary");
    }

    if (fathersoccupation) {
      data.push(fathersoccupation);
      columns.push("fathers_occupation");
    }

    if (mothersname) {
      data.push(mothersname);
      columns.push("mothers_name");
    }

    if (mothersoccupation) {
      data.push(mothersoccupation);
      columns.push("mothers_occupation");
    }

    if (mothersmonthly) {
      data.push(mothersmonthly);
      columns.push("mothers_salary");
    }

    if (imageFileGradeCopy) {              // New field
      data.push(imageFileGradeCopy);              // New field
      columns.push("grade_copy");              // New field
    }

    if (imageFileRegForm) {       // New field
      data.push(imageFileRegForm);       // New field
      columns.push("registration_form");       // New field
    }

    if (imageFileCertRes) {   // New field
      data.push(imageFileCertRes);   // New field
      columns.push("certificate_residency");   // New field
    }

    if (imageFileItr) {                     // New field
      data.push(imageFileItr);                     // New field
      columns.push("itr");                     // New field
    }

    if (imageFileNfi) {                      // New field
      data.push(imageFileNfi);                      // New field
      columns.push("nfi");                      // New field
    }

    if (imageFile) {                      // New field
      data.push(imageFile);                      // New field
      columns.push("image");                      // New field
    }

    if (studentid) {                      // New field
      data.push(studentid);                      // New field
      columns.push("studentid");                      // New field
    }

    if (scholarshipid) {                      // New field
      data.push(scholarshipid);
      columns.push("scholarshipid");
    }

    if (studentid) {                      // New field
      data.push(studentid);                      // New field
      arguments.push("studentid");                      // New field
    }

    
    let updateSql = UpdateStatement(
      "master_students_request",
      "msr",
      columns,
      arguments
    );

    let insertSql = InsertStatement("master_students_request", "msr", [
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
      "nfi",
      "scholarshipid"           // New field
    ]);

    let insrtData = [
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
      scholarshipid,
    ];
    
    let checkStatement = SelectStatement(
      "SELECT * FROM master_students_request WHERE msr_studentid = ?",
      [studentid]
    );
    
    Check(checkStatement)
      .then((result) => {
        if (result.length > 0) {
          Update(updateSql, data, (err, result) => {
            if (err) {
              console.log(err);
              res.json(JsonErrorResponse(err));
            }
            res.json(JsonSuccess());
          });
        } else {
          InsertTable(insertSql, [insrtData], (err, result) => {
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
