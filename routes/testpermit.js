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
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  Validator(req, res, "testpermitlayout");
  //res.render('institutionslayout', { title: 'Express' });
});

module.exports = router;


router.get("/loadqr", (req, res) => {
    try {
        let studentid = req.session.studentid;
        let sql = `SELECT
        sq_image
        FROM student_qrcode
        WHERE sq_studentid = '${studentid}'`;

        Select(sql, (err, result) => { 
            if (err) {  
                console.error(err);
                res.json(JsonErrorResponse(err));
            }

            console.log(result);

            if (result != 0) {
                let data = DataModeling(result, "sq_");

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