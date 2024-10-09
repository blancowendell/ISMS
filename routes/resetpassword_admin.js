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
//const nodemailer = require('nodemailer');
const { DataModeling } = require("../routes/model/ismsdb");
const { Encrypter } = require("./repository/crytography");
const { AdminLogin } = require("./repository/helper");
require("dotenv").config();
// const crypto = require('crypto');

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("resetpassword_adminlayout", { title: "Express" });
});

module.exports = router;



router.post("/change-password", async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json(JsonErrorResponse("Token and new password are required"));
    }

    try {
        const sql = `SELECT au_email FROM admin_user WHERE au_reset_password_token = '${token}'`;
        console.log(sql);
        
        
        Select(sql, (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json(JsonErrorResponse("Database error occurred"));
            }

            console.log(result,'resultch');
            

            if (result.length === 0) {
                return res.status(400).json(JsonErrorResponse("Invalid or expired token"));
            }

            const email = result[0].au_email;

            // Step 2: Use custom Encrypter function to encrypt the new password
            Encrypter(newPassword, (encryptionError, encryptedPassword) => {
                if (encryptionError) {
                    console.error("Error encrypting password:", encryptionError);
                    return res.status(500).json(JsonErrorResponse("Failed to encrypt password"));
                }

                // Step 3: Update the password in the database
                const updateSql = `UPDATE admin_user SET au_password = '${encryptedPassword}', au_reset_password_token = NULL WHERE au_email = '${email}'`;
                console.log(updateSql,'updateSql');
                

                Update(updateSql, (updateErr, updateResult) => {
                    if (updateErr) {
                        console.error("Error updating password:", updateErr);
                        return res.status(500).json(JsonErrorResponse("Failed to update password"));
                    }
                    console.log(updateResult,'result');
                    

                    return res.status(200).json(JsonSuccess("Password successfully updated"));
                });
            });
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json(JsonErrorResponse("An unexpected error occurred"));
    }
});