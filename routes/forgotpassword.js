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
const { mysqlQueryPromise } = require("./repository/ismsdb");
var router = express.Router();
const mysql = require("./repository/ismsdb");
const { Encrypter } = require("./repository/crytography");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("forgotpasswordlayout", { title: "Express" });
});

module.exports = router;

router.post("/resetpassword", (req, res) => {
    try {
        const { token, newPassword } = req.body;

        console.log(req.body);

        Encrypter(newPassword, async (err, encrypted) => {
            if (err) {
              console.error("Error: ", err);
              res.json({ msg: "error" });
            } else {
                const sql = `SELECT * FROM master_user WHERE mu_reset_token = '${token}' AND mu_reset_token_expiry > '${new Date().toISOString()}'`;

                mysql.mysqlQueryPromise(sql)
                    .then((result) => {
                        if (result.length === 0) {
                            // If no results, token is invalid or expired
                            return res.json(JsonErrorResponse({ msg: 'Invalid or expired token' }));
                        }
        
                        // Update the user's password
                        const user = result[0];
                        const updateSql = `UPDATE master_user SET mu_password = '${encrypted}', mu_reset_token = NULL, mu_reset_token_expiry = NULL WHERE mu_userid = ${user.mu_userid}`;
        
                        return mysql.mysqlQueryPromise(updateSql);
                    })
                    .then(() => {
                        res.json(JsonDataResponse({ msg: 'Password has been reset successfully' }));
                    })
                    .catch((error) => {
                        console.error(error);
                        res.json(JsonErrorResponse(error));
                    });
            
            }
          });
    } catch (error) {
        console.error(error);
        res.json(JsonErrorResponse(error));
    }
});
