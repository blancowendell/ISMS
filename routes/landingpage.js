const mysql = require("./repository/ismsdb");
const moment = require('moment');
var express = require("express");
const { MessageStatus, JsonErrorResponse, JsonSuccess, JsonWarningResponse, JsonDataResponse } = require("./repository/response");
const { SelectStatement, InsertStatement, GetCurrentDatetime } = require("./repository/customhelper");
const { InsertTable, Select } = require("./repository/dbconnect");
//const { Validator } = require("./controller/middleware");
var router = express.Router();
const currentYear = moment().format("YY");
const currentMonth = moment().format("MM");
const nodemailer = require('nodemailer');
const { DataModeling } = require("./model/ismsdb");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("landingpagelayout", { title: "Express" });
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

router.post("/save", async (req, res) => {
  try {
    let status = "UnVerified";
    let registerDate = GetCurrentDatetime();
    const {
      firstname,
      middlename,
      lastname,
      date_of_birth,
      email,
      gender,
      phone,
      institutionid,
      courseid,
      academic_status,
      yearlevel,
      birthplace,
      age,
      fathers_name,
      fathers_occupation,
      fathers_salary,
      mothers_name,
      mothers_occupation,
      mothers_salary,
    } = req.body;

    // Generate OTP
    let otp = Math.floor(100000 + Math.random() * 900000); // 6 digit OTP

    // Generate a student ID
    let newStudentID = await generateStudentId(currentYear, currentMonth);

    let sql = InsertStatement("master_students", "ms", [
      "studentid",
      "first_name",
      "middle_name",
      "last_name",
      "date_of_birth",
      "email",
      "gender",
      "phone",
      "status",
      "institutionid",
      "courseid",
      "academic_status",
      "yearlevel",
      "birthplace",
      "age",
      "fathers_name",
      "fathers_occupation",
      "fathers_salary",
      "mothers_name",
      "mothers_occupation",
      "mothers_salary",
      "registerdate",
      "otp",
    ]);

    let data = [
      [
        newStudentID,
        firstname,
        middlename,
        lastname,
        date_of_birth,
        email,
        gender,
        phone,
        status,
        institutionid,
        courseid,
        academic_status,
        yearlevel,
        birthplace,
        age,
        fathers_name,
        fathers_occupation,
        fathers_salary,
        mothers_name,
        mothers_occupation,
        mothers_salary,
        registerDate,
        otp,
      ],
    ];

    let checkStatement = SelectStatement(
      "select * from master_students where ms_email = ? or ms_first_name = ? and ms_last_name = ?",
      [email, firstname, lastname]
    );

    Check(checkStatement)
      .then((result) => {
        if (result != 0) {
          return res.json(JsonWarningResponse("Ooops Email already Exist"));
        } else {
          InsertTable(sql, data, (err, result) => {
            if (err) {
              console.log(err);
              res.json(JsonErrorResponse(err));
            }

            // Send OTP email
            let mailOptions = {
              from: 'your-email@gmail.com',
              to: email,
              subject: 'Your OTP Code',
              text: `Your OTP code is ${otp}. Please enter this code to verify your email.`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(error);
                return res.json(JsonErrorResponse("Failed to send OTP"));
              }

              res.json(JsonSuccess({ message: "OTP sent to your email" }));
            });
          });
        }
      })
      .catch((error) => {
        console.log(error);
        res.json(JsonErrorResponse(error));
      });
  } catch (error) {
    console.log(error);
    res.json(JsonErrorResponse(error));
  }
});


router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  let checkOtpQuery = SelectStatement(
    "SELECT * FROM master_students WHERE ms_email=? AND ms_otp=?",
    [email, otp]
  );

  Check(checkOtpQuery)
    .then((result) => {
      if (result != 0) {
        res.json(JsonSuccess());
      } else {
        res.json(JsonErrorResponse("Invalid OTP"));
      }
    })
    .catch((error) => {
      console.log(error);
      res.json(JsonErrorResponse(error));
    });
});

router.post("/send-create-account-link", (req, res) => {
  const { email } = req.body;

  let link = `http://localhost:3005/createuser?email=${email}`;

  let mailOptions = {
    from: 'ilsp.test.dev@gmail.com',
    to: email,
    subject: 'Create Your Account',
    text: `Click the link to create your account: ${link}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.json(JsonErrorResponse("Failed to send account creation link"));
    } else {
      res.json(JsonSuccess({ message: "Account creation link sent" }));
    }
  });
});


router.post("/send", (req, res) => {
  try {
    let message = req.body.message;
    let sql = `SELECT 
      mr_description,
      mq_description as mr_question
    FROM 
        master_questions  
    INNER JOIN 
        master_response 
    ON 
        master_questions.mq_responseid = master_response.mr_responseid
    WHERE 
        mq_description LIKE '%${message}%'`;

    console.log(message, 'body');

    // First SQL query to get data
    Select(sql, (error, result) => {
      if (error) {
        console.error(error);
        return res.json(JsonErrorResponse(error));
      }

      console.log(result);

      if (result && result.length > 0) {
        let data = DataModeling(result, "mr_");

        console.log(data);

        // Extract the mq_description from the result
        let selectedDescription = data[0].question;

        console.log(selectedDescription,'selectedDescription');
        

        // Update SQL query to increment count
        let updateSql = `UPDATE master_questions 
                         SET mq_questionask = mq_questionask + 1 
                         WHERE mq_description = '${selectedDescription}'`;

        // Perform the update operation
        mysql.mysqlQueryPromise(updateSql)
          .then((updateResult) => {
            console.log("Question count updated successfully:", updateResult);

            // Send the response only after successful update
            res.json(JsonDataResponse(data));
          })
          .catch((updateError) => {
            console.error("Error updating question count:", updateError);

            // Send the response even if there's an error updating the count
            res.json(JsonDataResponse(data)); // Send the data anyway
          });
      } else {
        // If no results, return an empty result
        res.json(JsonDataResponse(result));
      }
    });
  } catch (error) {
    console.log(error);
    res.json(JsonErrorResponse(error));
  }
});



router.get("/loadfrequentquestions", (req, res) => {
  try {
    let sql = `SELECT 
    mq_description
    FROM master_questions
    ORDER BY mq_questionask DESC
    LIMIT 5`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      //console.log(result);

      if (result != 0) {
        let data = DataModeling(result, "mq_");

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


router.get("/frequentquestions", (req, res) => {
  try {
    let sql = `SELECT 
    mq_description,
    mr_description as mq_answer
    FROM master_questions
    INNER JOIN master_response ON master_questions.mq_responseid = mr_responseid
    ORDER BY mq_questionask DESC
    LIMIT 5`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      //console.log(result);

      if (result != 0) {
        let data = DataModeling(result, "mq_");

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




// router.post("/save", async (req, res) => {
//   try {
//     let status = "UnVerified";
//     let registerDate = GetCurrentDatetime();
//     const {
//       firstname,
//       middlename,
//       lastname,
//       date_of_birth,
//       email,
//       gender,
//       phone,
//       institutionid,
//       courseid,
//       academic_status,
//       yearlevel,
//       birthplace,
//       age,
//       fathers_name,
//       fathers_occupation,
//       fathers_salary,
//       mothers_name,
//       mothers_occupation,
//       mothers_salary,
//     } = req.body;

//     const currentYear = new Date().getFullYear();
//     const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

//     let newStudentID = await generateStudentId(currentYear, currentMonth);

//     let sql = InsertStatement("master_students", "ms", [
//       "studentid",  // Adjusted column name to match the database field
//       "first_name",
//       "middle_name",
//       "last_name",
//       "date_of_birth",
//       "email",
//       "gender",
//       "phone",
//       "status",
//       "institutionid",
//       "courseid",
//       "academic_status",
//       "yearlevel",
//       "birthplace",
//       "age",
//       "fathers_name",
//       "fathers_occupation",
//       "fathers_salary",
//       "mothers_name",
//       "mothers_occupation",
//       "mothers_salary",
//       "registerdate",
//     ]);

//     let data = [
//       [
//         newStudentID,
//         firstname,
//         middlename,
//         lastname,
//         date_of_birth,
//         email,
//         gender,
//         phone,
//         status,
//         institutionid,
//         courseid,
//         academic_status,
//         yearlevel,
//         birthplace,
//         age,
//         fathers_name,
//         fathers_occupation,
//         fathers_salary,
//         mothers_name,
//         mothers_occupation,
//         mothers_salary,
//         registerDate,
//       ],
//     ];

//     let checkStatement = SelectStatement(
//       "select * from master_students where ms_email=?",
//       [email]
//     );

//     let result = await Check(checkStatement);

//     if (result.length > 0) {
//       return res.json(JsonWarningResponse(MessageStatus.EXIST));
//     } else {
//       InsertTable(sql, data, (err, result) => {
//         if (err) {
//           console.log(err);
//           res.json(JsonErrorResponse(err));
//         } else {
//           res.json(JsonSuccess());
//         }
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.json(JsonErrorResponse(error));
//   }
// });

// router.post("/save", (req, res) => {
//   try {
//     let status = "UnVerified";
//     let registerDate = GetCurrentDatetime();
//     const {
//       firstname,
//       middlename,
//       lastname,
//       date_of_birth,
//       email,
//       gender,
//       phone,
//       institutionid,
//       courseid,
//       academic_status,
//       yearlevel,
//       birthplace,
//       age,
//       fathers_name,
//       fathers_occupation,
//       fathers_salary,
//       mothers_name,
//       mothers_occupation,
//       mothers_salary,
//     } = req.body;
//     let newStudentID;

//     console.log(req.body);

//     newStudentID = generateStudentId(currentYear, currentMonth);
    

//     let sql = InsertStatement("master_students", "ms", [
//       "studentid",
//       "first_name",
//       "middle_name",
//       "last_name",
//       "date_of_birth",
//       "email",
//       "gender",
//       "phone",
//       "status",
//       "institutionid",
//       "courseid",
//       "academic_status",
//       "yearlevel",
//       "birthplace",
//       "age",
//       "fathers_name",
//       "fathers_occupation",
//       "fathers_salary",
//       "mothers_name",
//       "mothers_occupation",
//       "mothers_salary",
//       "registerdate",
//     ]);

//     console.log(sql);
    
//     let data = [
//       [
//         newStudentID,
//         firstname,
//         middlename,
//         lastname,
//         date_of_birth,
//         email,
//         gender,
//         phone,
//         status,
//         institutionid,
//         courseid,
//         academic_status,
//         yearlevel,
//         birthplace,
//         age,
//         fathers_name,
//         fathers_occupation,
//         fathers_salary,
//         mothers_name,
//         mothers_occupation,
//         mothers_salary,
//         registerDate,
//       ],
//     ];
//     console.log(data);


//     let checkStatement = SelectStatement(
//       "select * from master_students where ms_email=?",
//       [email]
//     );

//     Check(checkStatement)
//       .then((result) => {
//         console.log(result);
//         if (result != 0) {
//           return res.json(JsonWarningResponse(MessageStatus.EXIST));
//         } else {
//           InsertTable(sql, data, (err, result) => {
//             if (err) {
//               console.log(err);
//               res.json(JsonErrorResponse(err));
//             }

//             res.json(JsonSuccess());
//           });
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//         res.json(JsonErrorResponse(error));
//       });
//   } catch (error) {
//     //console.log(error);
//     res.json(JsonErrorResponse(error));
//   }
// });


//#region FUNCTION
function Check(sql) {
  return new Promise((resolve, reject) => {
    Select(sql, (err, result) => {
      if (err) reject(err);

      resolve(result);
    });
  });
}


function generateStudentId(year, month) {
  return new Promise((resolve, reject) => {
    const maxIdQuery = `SELECT count(*) as count FROM master_students WHERE ms_studentid LIKE '${year}${month}%'`;
    mysql
      .mysqlQueryPromise(maxIdQuery)
      .then((result) => {
        let currentCount = parseInt(result[0].count) + 1;
        const paddedNumericPart = String(currentCount).padStart(2, "0");

        let newStudentID = `${year}${month}${paddedNumericPart}`;

        resolve(newStudentID);
      })
      .catch((error) => {
        reject(error);
      });
  });
}


//#endregion

