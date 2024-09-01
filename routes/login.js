const { Encrypter } = require("./repository/crytography");
const { Select, Update } = require("./repository/dbconnect");
const { UserLogin } = require("./repository/helper");
const mysql = require("./repository/ismsdb");
//const moment = require('moment');
var express = require("express");
//const { Validator } = require("./controller/middleware");
var router = express.Router();
//const currentDate = moment();
require("dotenv").config();
const nodemailer = require('nodemailer');
crypto = require('crypto');
const { JsonErrorResponse, JsonWarningResponse, MessageStatus, JsonSuccess } = require("./repository/response");
const { SelectStatement } = require("./repository/customhelper");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('loginlayout', { title: 'Express' });
  });
  
module.exports = router;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ilsp.test.dev@gmail.com', // your eil
    pass: 'ujrf kdtj uwei conl', // your emamail password or app password
  },
});


router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    console.log(req.body);
    

    Encrypter(password, (err, encrypted) => {
      if (err) console.error("Error: ", err);
      let sql = `SELECT
      mu_studentid AS studentid,
      CONCAT(ms_last_name,' ',ms_first_name) AS fullname,
      ma_accessname AS accesstype,
      ms_status AS status,
      ms_image AS image
      FROM master_user
      INNER JOIN master_students ON master_user.mu_studentid = ms_studentid
      INNER JOIN master_access ON master_user.mu_accesstypeid = ma_accessid
      WHERE mu_username = '${username}'
      AND mu_password = '${encrypted}'`;

      console.log(sql);
      

      mysql.mysqlQueryPromise(sql)
        .then((result) => {
          if (result.length !== 0) {
            const user = result[0];

            console.log(result,'result');
            

            if (
              user.status === "UnVerified" || user.status === "Verified"
            ) {
              let data = UserLogin(result);
                data.forEach((user) => {
                  req.session.studentid = user.studentid;
                  req.session.fullname = user.fullname;
                  req.session.accesstype = user.accesstype;
                  req.session.status = user.status;
                  req.session.image = user.image;
                });
                console.log('accesstype',req.session.accesstype);
                return res.json({
                  msg: "success",
                  data: data,
                });
            } else {
              return res.json({
                msg: "graduated",
              });
            }
          } else {
            return res.json({
              msg: "incorrect",
            });
          }
        })
        .catch((error) => {
          return res.json({
            msg: "error",
            data: error,
          });
        });
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});


router.post("/forgotpassword", (req, res) => {
  try {
    const { email } = req.body;

    // Prepare the SQL statement using your custom SelectStatement function
    let checkStatement = SelectStatement(
      "select * from master_user where mu_email = ?",
      [email]
    );

    // Use your custom Check function to execute the query
    Check(checkStatement)
      .then((result) => {
        if (result.length === 0) { // Corrected the condition to check if no results were returned
          return res.json(JsonWarningResponse(MessageStatus.NOTEXIST));
        } else {
          // Generate a unique token for password reset
          const resetToken = crypto.randomBytes(20).toString('hex');
          const resetTokenExpiry = new Date(Date.now() + 3600000)
            .toISOString().slice(0, 19).replace('T', ' '); // Token expires in 1 hour

          // Prepare the SQL update statement
          const updateSql = `UPDATE master_user SET mu_reset_token = '${resetToken}', mu_reset_token_expiry = '${resetTokenExpiry}' WHERE mu_email = '${email}'`;

          // Use your custom Update function to execute the update
          Update(updateSql, (err, result) => {
            if (err) {
              console.error(err);
              return res.json(JsonErrorResponse(err)); // Return error response if update fails
            }

            // Generate the reset link (without token in the URL)
            const host = process.env._HOST_ADMIN;
            const port = process.env._PORT_ADMIN;
            const resetLink = `http://${host}:${port}/forgotpassword`; // No token in the URL

            // Send the reset email with the token in the body
            transporter.sendMail({
              to: email,
              subject: 'Password Reset Request',
              html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour. <br> Use the following token to complete the reset: <strong>${resetToken}</strong></p>`
            }, (mailErr) => {
              if (mailErr) {
                console.error(mailErr);
                return res.json(JsonErrorResponse(mailErr)); // Return error response if email fails
              }

              // If everything is successful, send a success response
              res.json(JsonSuccess());
            });
          });
        }
      })
      .catch((error) => {
        console.error(error);
        res.json(JsonErrorResponse(error)); // Catch and handle any errors
      });
  } catch (error) {
    console.error(error);
    res.json(JsonErrorResponse(error)); // Catch and handle any unexpected errors
  }
});



router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err)
      res.json({
        msg: err,
      });
    res.json({
      msg: "success",
    });
  });
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





