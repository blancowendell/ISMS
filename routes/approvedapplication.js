const mysql = require("./repository/ismsdb");
//const moment = require('moment');
var express = require("express");
const { UserValidator } = require("./controller/middleware");
const {
  JsonErrorResponse,
  JsonSuccess,
  JsonWarningResponse,
  MessageStatus,
  JsonDataResponse,
} = require("./repository/response");
const { InsertTable, Select } = require("./repository/dbconnect");
const {
  SelectStatement,
  InsertStatement,
} = require("./repository/customhelper");
const { DataModeling } = require("./model/ismsdb");
var router = express.Router();
const ExcelJS = require("exceljs");
const nodemailer = require("nodemailer"); // Make sure to require nodemailer
//const currentDate = moment();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("studentprofile");
  UserValidator(req, res, "approvedapplicationlayout");
});

module.exports = router;



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
          WHERE msr_status = 'Verified'`;
  
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
          s_name as ms_scholarname,
          mc_name_code as ms_course_code,
          mi_name as ms_schoolname,
          CONCAT(ms_first_name,' ',ms_middle_name,' ',ms_last_name) as ms_fullname,
          DATE_FORMAT(ms_date_of_birth, '%Y-%m-%d') AS ms_date_of_birth,
          DATE_FORMAT(ms_registerdate, '%Y-%m-%d') AS ms_registerdate
          FROM master_students
          INNER JOIN master_institutions ON master_students.ms_institutionid = mi_institutionsid
          INNER JOIN master_courses ON master_students.ms_courseid = mc_course_id
          INNER JOIN scholarship ON master_students.ms_scholarshipid = s_scholarship_id
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


  router.post("/export", async (req, res) => {
    try {
      let barranggay = req.body.barranggay;
      let schoolyear = req.body.schoolyear;
  
      let sql = `SELECT
        s_name,
        ms_studentid,
        ms_first_name,
        ms_last_name,
        ms_middle_name,
        ms_date_of_birth,
        ms_email,
        ms_gender,
        ms_phone,
        ms_city,
        ms_baranggay,
        ms_village,
        ms_street,
        ms_house_no,
        ms_status,
        mi_name,
        mc_name_code,
        ms_academic_status,
        ms_yearlevel,
        ms_birthplace,
        ms_age,
        ms_fathers_name,
        ms_fathers_occupation,
        ms_fathers_salary,
        ms_mothers_name,
        ms_mothers_occupation,
        ms_mothers_salary,
        ms_registerdate
        FROM master_students
        INNER JOIN master_institutions ON master_students.ms_institutionid = mi_institutionsid
        INNER JOIN scholarship ON master_students.ms_scholarshipid = s_scholarship_id
        INNER JOIN master_courses ON master_students.ms_courseid = mc_course_id
        WHERE ms_baranggay = '${barranggay}'
        AND ms_scholarshipid = '${schoolyear}'`;
  
      Select(sql, async (err, result) => {
        if (err) {
          console.error(err);
          res.json(JsonErrorResponse(err));
          return;
        }
  
        if (result.length > 0) {
  
          let s_name = result[0].s_name;
          
          let workbook = new ExcelJS.Workbook();
          let worksheet = workbook.addWorksheet("Students");
          worksheet.columns = [
            { header: "School Year", key: "s_name", width: 20 },
            { header: "Applicant ID", key: "ms_studentid", width: 15 },
            { header: "First Name", key: "ms_first_name", width: 20 },
            { header: "Last Name", key: "ms_last_name", width: 20 },
            { header: "Middle Name", key: "ms_middle_name", width: 20 },
            { header: "Date of Birth", key: "ms_date_of_birth", width: 15 },
            { header: "Email", key: "ms_email", width: 30 },
            { header: "Gender", key: "ms_gender", width: 10 },
            { header: "Phone", key: "ms_phone", width: 15 },
            { header: "City", key: "ms_city", width: 20 },
            { header: "Baranggay", key: "ms_baranggay", width: 20 },
            { header: "Village", key: "ms_village", width: 20 },
            { header: "Street", key: "ms_street", width: 20 },
            { header: "House No", key: "ms_house_no", width: 10 },
            { header: "Status", key: "ms_status", width: 15 },
            { header: "Institution Name", key: "mi_name", width: 20 },
            { header: "Course Code", key: "mc_name_code", width: 15 },
            { header: "Academic Status", key: "ms_academic_status", width: 20 },
            { header: "Year Level", key: "ms_yearlevel", width: 10 },
            { header: "Birthplace", key: "ms_birthplace", width: 20 },
            { header: "Age", key: "ms_age", width: 10 },
            { header: "Father's Name", key: "ms_fathers_name", width: 20 },
            {
              header: "Father's Occupation",
              key: "ms_fathers_occupation",
              width: 20,
            },
            { header: "Father's Salary", key: "ms_fathers_salary", width: 15 },
            { header: "Mother's Name", key: "ms_mothers_name", width: 20 },
            {
              header: "Mother's Occupation",
              key: "ms_mothers_occupation",
              width: 20,
            },
            { header: "Mother's Salary", key: "ms_mothers_salary", width: 15 },
            { header: "Register Date", key: "ms_registerdate", width: 15 },
          ];
  
          worksheet.getRow(1).font = { bold: true };
          worksheet.getRow(1).alignment = {
            vertical: "middle",
            horizontal: "center",
          };
  
          result.forEach((row) => {
            worksheet.addRow(row);
          });
  
          worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
            row.alignment = { vertical: "middle", horizontal: "center" };
          });
  
          const filename = `${s_name}_${barranggay}.xlsx`;
  
          res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  
          await workbook.xlsx.write(res);
          res.end();
  
          await workbook.xlsx.write(res);
          res.end();
        } else {
          res.json(JsonDataResponse([]));
        }
      });
    } catch (error) {
      console.error(error);
      res.json(JsonErrorResponse(error));
    }
  });
  
  