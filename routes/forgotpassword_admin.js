const mysql = require("../routes/repository/ismsdb");
const moment = require('moment');
var express = require("express");
const { MessageStatus, JsonErrorResponse, JsonSuccess, JsonWarningResponse, JsonDataResponse } = require("./repository/response");
const { SelectStatement, InsertStatement, GetCurrentDatetime } = require("./repository/customhelper");
const { InsertTable, Select, Update } = require("./repository/dbconnect");
//const { Validator } = require("./controller/middleware");
var router = express.Router();
const currentYear = moment().format("YY");
const currentMonth = moment().format("MM");
const nodemailer = require('nodemailer');
const { DataModeling } = require("../routes/model/ismsdb");
const { Encrypter } = require("./repository/crytography");
const { AdminLogin } = require("./repository/helper");
require("dotenv").config();
const crypto = require('crypto');

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("forgotpassword_adminlayout", { title: "Express" });
});

module.exports = router;


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ilsp.test.dev@gmail.com', // your email
        pass: 'ujrf kdtj uwei conl', // your email password or app password
    },
    port: 587, // Use port 587 instead of 465
    secure: false, // Set secure to false when using port 587
    tls: {
      rejectUnauthorized: false,
    },
  });
  
  router.post("/reset-password", async (req, res) => {
    const { email } = req.body;
  
    const host = process.env._HOST_ADMIN;
    const port = process.env._PORT_ADMIN;
    const emailhost = process.env._EMAIL_HOST;
  
    if (!email) {
      return res.status(400).json(JsonErrorResponse("Email is required"));
    }
  
    try {
      const sql = `SELECT * FROM admin_user WHERE au_email = '${email}'`;
  
      Select(sql, async (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json(JsonErrorResponse("Failed to check email in the database"));
        }
  
        if (result.length === 0) {
          return res.status(404).json(JsonWarningResponse("Email not found"));
        }
  
        // Generate a token and store it in the database with an expiry time (if needed)
        const token = crypto.randomBytes(20).toString('hex');
        const resetLink = `http://${emailhost}:${port}/resetpassword_admin?token=${token}`;
  
        // Update the token in the database for that user
        const updateTokenSql = `UPDATE admin_user SET au_reset_password_token = '${token}' WHERE au_email = '${email}'`;
        Update(updateTokenSql, async (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating token in the database:", updateErr);
            return res.status(500).json(JsonErrorResponse("Failed to generate reset token"));
          }
  
          // Define the email options
          const mailOptions = {
            from: "cgms.test.spcpc@gmail.com",
            to: email,
            subject: "Password Reset Request",
            text: `You are receiving this email because you (or someone else) have requested a password reset. \n\n` +
                  `Please click on the following link to reset your password: \n${resetLink}\n\n` +
                  `If you did not request this, please ignore this email.\n`
          };
  
          // Send the email
          try {
            await transporter.sendMail(mailOptions);
            return res.status(200).json(JsonSuccess("Password reset link and token sent to your email"));
          } catch (emailError) {
            console.error("Error sending email:", emailError);
            return res.status(500).json(JsonErrorResponse("Failed to send password reset email"));
          }
        });
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      return res.status(500).json(JsonErrorResponse("An unexpected error occurred"));
    }
  });
  
  