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
const QRCode = require('qrcode');

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("studentprofile");
  UserValidator(req, res, "pendingapplicationlayout");
});

module.exports = router;

// Setup nodemailer transport
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ilsp.test.dev@gmail.com", // your email
    pass: "ujrf kdtj uwei conl", // your email password or app password
  },
});

router.get("/load", function (req, res, next) {
  try {
    let sql = `SELECT
      msr_image,
      msr_studentid,
      CONCAT(msr_first_name,' ',msr_middle_name,' ',msr_last_name) as msr_fullname,
      msr_institutionid,
      msr_courseid,
      msr_city,
      msr_baranggay,
      msr_academic_status,
      msr_yearlevel,
      msr_email,
      msr_phone
      FROM master_students_request
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
    msr_courseid as msr_course_code,
    msr_institutionid as msr_schoolname,
    CONCAT(msr_first_name,' ',msr_middle_name,' ',msr_last_name) as msr_fullname,
    DATE_FORMAT(msr_date_of_birth, '%Y-%m-%d') AS msr_date_of_birth,
    DATE_FORMAT(msr_registerdate, '%Y-%m-%d') AS msr_registerdate
    FROM master_students_request
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
  const requirements = req.body.requirements || []; // get the selected requirements

  if (!studentid) {
    return res.status(400).json({ error: "Student ID is required" });
  }

  if (!rejectionMessage) {
    return res.status(400).json({ error: "Rejection message is required" });
  }

  try {
    // Fetch the student's email address
    const fetchStudentQuery = `
      SELECT ms_email 
      FROM master_students 
      WHERE ms_studentid = ?`;

    const studentResults = await mysql.mysqlQueryPromise({
      sql: fetchStudentQuery,
      values: [studentid],
    });

    if (studentResults.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const studentEmail = studentResults[0].ms_email;

    // Update the request from master_students_request
    const updateQuery = `
          UPDATE master_students_request SET
          msr_status = 'Rejected'
          WHERE msr_studentid = ?`;

    await mysql.mysqlQueryPromise({ sql: updateQuery, values: [studentid] });

    // Prepare the rejection email content
    let emailContent = `${rejectionMessage}\n\n`;

    if (requirements.length > 0) {
      emailContent += "The following requirements were not submitted:\n";
      requirements.forEach((requirement) => {
        emailContent += `- ${requirement}\n`;
      });
    }

    // Send rejection email
    let mailOptions = {
      from: "ilsp.test.dev@gmail.com", // your email
      to: studentEmail,
      subject: "Application Rejected",
      text: emailContent,
    };

    await transporter.sendMail(mailOptions);

    res.json(JsonSuccess());
  } catch (error) {
    console.error(error);
    res.json(JsonErrorResponse(error));
  }
});


// router.post("/reject", async (req, res) => {
//   const studentid = req.body.studentid;
//   const rejectionMessage = req.body.message;

//   if (!studentid) {
//     return res.status(400).json({ error: "Student ID is required" });
//   }

//   if (!rejectionMessage) {
//     return res.status(400).json({ error: "Rejection message is required" });
//   }

//   try {
//     // Fetch the student's email address
//     const fetchStudentQuery = `
//       SELECT ms_email 
//       FROM master_students 
//       WHERE ms_studentid = ?`;

//     const studentResults = await mysql.mysqlQueryPromise({
//       sql: fetchStudentQuery,
//       values: [studentid],
//     });

//     if (studentResults.length === 0) {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     const studentEmail = studentResults[0].ms_email;

//     // Delete the request from master_students_request
//     const deleteQuery = `
//       DELETE FROM master_students_request 
//       WHERE msr_studentid = ?`;

//     await mysql.mysqlQueryPromise({ sql: deleteQuery, values: [studentid] });

//     // Send rejection email
//     let mailOptions = {
//       from: "ilsp.test.dev@gmail.com", // your email
//       to: studentEmail,
//       subject: "Application Rejected",
//       text: rejectionMessage,
//     };

//     await transporter.sendMail(mailOptions);

//     res.json(JsonSuccess());
//   } catch (error) {
//     console.error(error);
//     res.json(JsonErrorResponse(error));
//   }
// });

router.post("/approved", async (req, res) => {
  const studentid = req.body.studentid;

  if (!studentid) {
    return res.json(JsonErrorResponse(studentid));
  }

  try {
    const fetchRequestQuery = `
      SELECT * FROM master_students_request 
      WHERE msr_studentid = ?`;

    const requestResults = await mysql.mysqlQueryPromise({
      sql: fetchRequestQuery,
      values: [studentid],
    });

    if (requestResults.length === 0) {
      return res.json(JsonDataResponse(requestResults));
    }

    const requestData = requestResults[0];


    const fetchMsOtp = `
      SELECT ms_otp
      FROM master_students 
      WHERE ms_studentid = ?`;

    const requestOtpResults = await mysql.mysqlQueryPromise({
      sql: fetchMsOtp,
      values: [studentid],
    });

    const requestOtp = requestOtpResults[0];

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
        ms_nfi = ?,
        ms_first_sem_grade = ?,
        ms_second_sem_grade = ?
      WHERE ms_studentid = ?`;

      console.log(updateQuery,'updatequery');
      

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
      requestData.msr_first_sem_grade,
      requestData.msr_second_sem_grade,
      studentid,
    ];

    console.log(updateValues,'updatevalues');
    

    await mysql.mysqlQueryPromise({ sql: updateQuery, values: updateValues });

    const qrData = `${studentid}-${requestOtp.ms_otp}`;
    const qrCodeImage = await QRCode.toDataURL(qrData);

    console.log(qrData,'qrdata');
    
    const insertQRCodeQuery = `
      INSERT INTO student_qrcode (sq_studentid, sq_image, sq_createdate, sq_createby, sq_status)
      VALUES (?, ?, NOW(), ?, 'Active')`;

    const insertQRCodeValues = [studentid, qrCodeImage, 'system'];

    await mysql.mysqlQueryPromise({
      sql: insertQRCodeQuery,
      values: insertQRCodeValues,
    });

    const fetchStudentQuery = `
      SELECT ms_email 
      FROM master_students 
      WHERE ms_studentid = ?`;

    const studentResults = await mysql.mysqlQueryPromise({
      sql: fetchStudentQuery,
      values: [studentid],
    });

    if (studentResults.length === 0) {
      return res.json(JsonDataResponse(studentResults));
    }

    const studentEmail = studentResults[0].ms_email;

    // Send email notification
    // Assuming requestData contains the first and last name
    const firstName = requestData.msr_first_name;
    const lastName = requestData.msr_last_name;
    const host = process.env._EMAIL_HOST;
    const port = process.env._PORT_ADMIN;

    // Send email notification
    let mailOptions = {
    from: "ilsp.test.dev@gmail.com",
    to: studentEmail,
    subject: "Verified Application",
    text: `Dear ${firstName} ${lastName},

    We are pleased to inform you that your application has been successfully verified. Please find your Application ID and further instructions below.

    Next Step: Upload Required Documents
    To complete your application process, please upload the necessary documents.
    
    link = http://${host}:${port}/login

    Ensure that all documents are clear and meet the submission requirements.`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Update status in master_students_request
    const updateStatusQuery = `
      UPDATE master_students_request 
      SET msr_status = 'Verified' 
      WHERE msr_studentid = ?`;

    await mysql.mysqlQueryPromise({
      sql: updateStatusQuery,
      values: [studentid],
    });

    res.json(JsonSuccess());
  } catch (error) {
    console.error(error);
    res.json(JsonErrorResponse(error));
  }
});

router.get("/barranggaydistinct", (req, res) => {
  try {
    let sql = `SELECT DISTINCT msr_baranggay
    FROM master_students_request`;

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

router.post("/export", async (req, res) => {
  try {
    let barranggay = req.body.barranggay;
    let schoolyear = req.body.schoolyear;

    let sql = `SELECT
      s_name,
      msr_studentid,
      msr_first_name,
      msr_last_name,
      msr_middle_name,
      msr_date_of_birth,
      msr_email,
      msr_gender,
      msr_phone,
      msr_city,
      msr_baranggay,
      msr_village,
      msr_street,
      msr_house_no,
      msr_status,
      msr_institutionid as mi_name,
      msr_courseid as mc_name_code,
      msr_academic_status,
      msr_yearlevel,
      msr_birthplace,
      msr_age,
      msr_fathers_name,
      msr_fathers_occupation,
      msr_fathers_salary,
      msr_mothers_name,
      msr_mothers_occupation,
      msr_mothers_salary,
      msr_registerdate
      FROM master_students_request
      INNER JOIN scholarship ON master_students_request.msr_scholarshipid = s_scholarship_id
      WHERE msr_baranggay = '${barranggay}'
      AND msr_scholarshipid = '${schoolyear}'
      AND msr_status = 'Applied'`;

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
          { header: "Applicant ID", key: "msr_studentid", width: 15 },
          { header: "First Name", key: "msr_first_name", width: 20 },
          { header: "Last Name", key: "msr_last_name", width: 20 },
          { header: "Middle Name", key: "msr_middle_name", width: 20 },
          { header: "Date of Birth", key: "msr_date_of_birth", width: 15 },
          { header: "Email", key: "msr_email", width: 30 },
          { header: "Gender", key: "msr_gender", width: 10 },
          { header: "Phone", key: "msr_phone", width: 15 },
          { header: "City", key: "msr_city", width: 20 },
          { header: "Baranggay", key: "msr_baranggay", width: 20 },
          { header: "Village", key: "msr_village", width: 20 },
          { header: "Street", key: "msr_street", width: 20 },
          { header: "House No", key: "msr_house_no", width: 10 },
          { header: "Status", key: "msr_status", width: 15 },
          { header: "Institution Name", key: "mi_name", width: 20 },
          { header: "Course Code", key: "mc_name_code", width: 15 },
          { header: "Academic Status", key: "msr_academic_status", width: 20 },
          { header: "Year Level", key: "msr_yearlevel", width: 10 },
          { header: "Birthplace", key: "msr_birthplace", width: 20 },
          { header: "Age", key: "msr_age", width: 10 },
          { header: "Father's Name", key: "msr_fathers_name", width: 20 },
          {
            header: "Father's Occupation",
            key: "msr_fathers_occupation",
            width: 20,
          },
          { header: "Father's Salary", key: "msr_fathers_salary", width: 15 },
          { header: "Mother's Name", key: "msr_mothers_name", width: 20 },
          {
            header: "Mother's Occupation",
            key: "msr_mothers_occupation",
            width: 20,
          },
          { header: "Mother's Salary", key: "msr_mothers_salary", width: 15 },
          { header: "Register Date", key: "msr_registerdate", width: 15 },
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
