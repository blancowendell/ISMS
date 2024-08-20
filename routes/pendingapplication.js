const mysql = require("./repository/ismsdb");
//const moment = require('moment');
var express = require("express");
const { UserValidator } = require("./controller/middleware");
const { JsonErrorResponse, JsonSuccess, JsonWarningResponse, MessageStatus, JsonDataResponse } = require("./repository/response");
const { InsertTable, Select } = require("./repository/dbconnect");
const { SelectStatement, InsertStatement } = require("./repository/customhelper");
const { DataModeling } = require("./model/ismsdb");
var router = express.Router();
const nodemailer = require('nodemailer'); // Make sure to require nodemailer
//const currentDate = moment();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("studentprofile");
  UserValidator(req, res, "pendingapplicationlayout");
});

module.exports = router;


// Setup nodemailer transport
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ilsp.test.dev@gmail.com', // your email
    pass: 'ujrf kdtj uwei conl', // your email password or app password
  },
});


router.get("/load", function (req, res, next) {
    try {
        let sql = `SELECT
        msr_image,
        msr_studentid,
        CONCAT(msr_first_name,' ',msr_middle_name,' ',msr_last_name) as msr_fullname,
        mi_name as msr_institutionid,
        mc_name_code as msr_courseid,
        msr_city,
        msr_baranggay,
        msr_academic_status,
        msr_yearlevel,
        msr_email,
        msr_phone
        FROM master_students_request
        INNER JOIN master_institutions ON master_students_request.msr_institutionid = mi_institutionsid
        INNER JOIN master_courses ON master_students_request.msr_courseid = mc_course_id
        WHERE msr_status = 'Applied'`;

        Select(sql, (err, result) => {
            if (err) {
              console.error(err);
              res.json(JsonErrorResponse(err));
            }
      
            console.log(result);
      
            if (result != 0) {
              let data = DataModeling(result, "msr_");
      
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


router.post("/loadstudentrequest", (req, res) => {
  try {
    let studentid = req.body.studentid;
    let sql = `SELECT 
        *,
        mc_name_code as msr_course_code,
        mi_name as msr_schoolname,
        CONCAT(msr_first_name,' ',msr_middle_name,' ',msr_last_name) as msr_fullname,
        DATE_FORMAT(msr_date_of_birth, '%Y-%m-%d') AS msr_date_of_birth,
        DATE_FORMAT(msr_registerdate, '%Y-%m-%d') AS msr_registerdate
        FROM master_students_request
        INNER JOIN master_institutions ON master_students_request.msr_institutionid = mi_institutionsid
        INNER JOIN master_courses ON master_students_request.msr_courseid = mc_course_id
        WHERE msr_studentid = '${studentid}'`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      console.log(result);

      if (result != 0) {
        let data = DataModeling(result, "msr_");

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


router.post("/reject", async (req, res) => {
  const studentid = req.body.studentid;
  const rejectionMessage = req.body.message;

  if (!studentid) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  if (!rejectionMessage) {
    return res.status(400).json({ error: 'Rejection message is required' });
  }

  try {
    // Fetch the student's email address
    const fetchStudentQuery = `
      SELECT ms_email 
      FROM master_students 
      WHERE ms_studentid = ?`;

    const studentResults = await mysql.mysqlQueryPromise({ sql: fetchStudentQuery, values: [studentid] });

    if (studentResults.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentEmail = studentResults[0].ms_email;

    // Delete the request from master_students_request
    const deleteQuery = `
      DELETE FROM master_students_request 
      WHERE msr_studentid = ?`;

    await mysql.mysqlQueryPromise({ sql: deleteQuery, values: [studentid] });

    // Send rejection email
    let mailOptions = {
      from: 'ilsp.test.dev@gmail.com', // your email
      to: studentEmail,
      subject: 'Application Rejected',
      text: rejectionMessage,
    };

    await transporter.sendMail(mailOptions);

    res.json(JsonSuccess());

  } catch (error) {
    console.error(error);
    res.json(JsonErrorResponse(error));
  }
});



router.post("/approved", async (req, res) => {
  const studentid = req.body.studentid;

  if (!studentid) {
    return res.json(JsonErrorResponse(studentid));
  }

  try {
    // Fetch student request data
    const fetchRequestQuery = `
      SELECT * FROM master_students_request 
      WHERE msr_studentid = ?`;
      
    const requestResults = await mysql.mysqlQueryPromise({ sql: fetchRequestQuery, values: [studentid] });

    if (requestResults.length === 0) {
      return res.json(JsonDataResponse(requestResults));
    }

    const requestData = requestResults[0];

    // Update student data
    const updateQuery = `
      UPDATE master_students 
      SET 
        ms_image = ?, 
        ms_first_name = ?, 
        ms_middle_name = ?, 
        ms_last_name = ?, 
        ms_preffix = ?, 
        ms_date_of_birth = ?, 
        ms_gender = ?, 
        ms_phone = ?, 
        ms_city = ?, 
        ms_baranggay = ?, 
        ms_village = ?, 
        ms_street = ?, 
        ms_house_no = ?, 
        ms_status = ?, 
        ms_institutionid = ?, 
        ms_courseid = ?, 
        ms_academic_status = ?, 
        ms_yearlevel = ?, 
        ms_birthplace = ?, 
        ms_age = ?, 
        ms_fathers_name = ?, 
        ms_fathers_occupation = ?, 
        ms_fathers_salary = ?, 
        ms_mothers_name = ?, 
        ms_mothers_occupation = ?, 
        ms_mothers_salary = ?, 
        ms_registerdate = ?, 
        ms_grade_copy = ?, 
        ms_registration_form = ?, 
        ms_certificate_residency = ?, 
        ms_itr = ?, 
        ms_nfi = ?
      WHERE ms_studentid = ?`;

    const updateValues = [
      requestData.msr_image,
      requestData.msr_first_name,
      requestData.msr_middle_name,
      requestData.msr_last_name,
      requestData.msr_preffix,
      requestData.msr_date_of_birth,
      requestData.msr_gender,
      requestData.msr_phone,
      requestData.msr_city,
      requestData.msr_baranggay,
      requestData.msr_village,
      requestData.msr_street,
      requestData.msr_house_no,
      "Verified",
      requestData.msr_institutionid,
      requestData.msr_courseid,
      requestData.msr_academic_status,
      requestData.msr_yearlevel,
      requestData.msr_birthplace,
      requestData.msr_age,
      requestData.msr_fathers_name,
      requestData.msr_fathers_occupation,
      requestData.msr_fathers_salary,
      requestData.msr_mothers_name,
      requestData.msr_mothers_occupation,
      requestData.msr_mothers_salary,
      requestData.msr_registerdate,
      requestData.msr_grade_copy,
      requestData.msr_registration_form,
      requestData.msr_certificate_residency,
      requestData.msr_itr,
      requestData.msr_nfi,
      studentid
    ];

    await mysql.mysqlQueryPromise({ sql: updateQuery, values: updateValues });

    // Fetch the email address
    const fetchStudentQuery = `
      SELECT ms_email 
      FROM master_students 
      WHERE ms_studentid = ?`;

    const studentResults = await mysql.mysqlQueryPromise({ sql: fetchStudentQuery, values: [studentid] });

    if (studentResults.length === 0) {
      return res.json(JsonDataResponse(studentResults));
    }

    const studentEmail = studentResults[0].ms_email;

    // Send email notification
    let mailOptions = {
      from: 'ilsp.test.dev@gmail.com', 
      to: studentEmail,
      subject: 'Congratulations!',
      text: 'Congratulations! You are now a Verified Scholar ng Lungsod ng Sanpedro Laguna.',
    };

    await transporter.sendMail(mailOptions);

    // Update status in master_students_request
    const updateStatusQuery = `
      UPDATE master_students_request 
      SET msr_status = 'Verified' 
      WHERE msr_studentid = ?`;

    await mysql.mysqlQueryPromise({ sql: updateStatusQuery, values: [studentid] });

    res.json(JsonSuccess());

  } catch (error) {
    console.error(error);
    res.json(JsonErrorResponse(error));
  }
});
