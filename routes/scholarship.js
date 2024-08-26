const mysql = require("./repository/ismsdb");
//const moment = require('moment');
var express = require("express");
const { Validator } = require("./controller/middleware");
const { JsonErrorResponse, JsonSuccess, JsonWarningResponse, MessageStatus, JsonDataResponse } = require("./repository/response");
const { InsertTable, Select, Update } = require("./repository/dbconnect");
const { SelectStatement, InsertStatement, GetCurrentDatetime, UpdateStatement } = require("./repository/customhelper");
const { DataModeling } = require("./model/ismsdb");
var router = express.Router();
const nodemailer = require('nodemailer'); // Make sure to require nodemailer
//const currentDate = moment();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("studentprofile");
  Validator(req, res, "scholarshiplayout");
});

module.exports = router;

router.post("/save", async (req, res) => {
  try {
    let scholarname = req.body.scholarname;
    let scholardesc = req.body.scholardesc;
    let maxslots = req.body.maxslots;
    let startdate = req.body.startdate;
    let enddate = req.body.enddate;
    let createdBy = req.session.fullname;

    let scholarInsertSql = InsertStatement("scholarship", "s", [
      "name",
      "description",
      "total_slots",
      "available_slots",
      "start_date",
      "end_date",
      "status",
    ]);

    let scholarData = [
      [
        scholarname,
        scholardesc,
        maxslots,
        maxslots,
        startdate,
        enddate,
        "Active",
      ],
    ];

    let checkStatement = SelectStatement(
      "select * from scholarship where s_name=? and s_start_date=? and s_end_date=?",
      [scholarname, startdate, enddate]
    );

    Check(checkStatement)
      .then((result) => {
        if (result.length > 0) {
          return res.json(JsonWarningResponse(MessageStatus.EXIST));
        } else {
          InsertTable(scholarInsertSql, scholarData, (err, scholarResult) => {
            if (err) {
              console.log(err);
              return res.json(JsonErrorResponse(err));
            }

            console.log(scholarResult,'result');
            
            let s_scholarship_id = scholarResult[0].id;
            console.log(s_scholarship_id,'s_scholarship_id');
            
            let configInsertSql = InsertStatement("scholarship_config", "sc", [
              "scholarship_id",
              "max_slots",
              "created_by",
              "created_at",
            ]);

            let configData = [
              [
                s_scholarship_id,
                maxslots,
                createdBy,
                new Date() 
             ],
            ];

            InsertTable(configInsertSql, configData, (err, configResult) => {
              if (err) {
                console.log(err);
                return res.json(JsonErrorResponse(err));
              }

              res.json(JsonSuccess());
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


router.get("/loadscholarlandingpage", (req, res) => {
  try {
    let sql = `
    SELECT
    s_scholarship_id,
    s_name 
    FROM scholarship
    WHERE s_status = 'Active' AND s_available_slots > 0`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      //console.log(result);

      if (result != 0) {
        let data = DataModeling(result, "s_");

        //console.log(data);
        res.json(JsonDataResponse(data));
      } else {
        res.json(JsonDataResponse(result));
      }
    });
  } catch (error) {
    console.log(error);
    res.json(JsonErrorResponse(error));
  }
});


router.post("/getscholarship", (req, res) => {
  try {
    let scholarshipid = req.body.scholarshipid;
    let sql = `SELECT 
      s_name,
      DATE_FORMAT(s_start_date, '%Y-%m-%d') as s_start_date,
      DATE_FORMAT(s_end_date, '%Y-%m-%d') as s_end_date,
      s_status
      FROM scholarship_config
      INNER JOIN scholarship ON scholarship_config.sc_scholarship_id = s_scholarship_id
      WHERE s_scholarship_id = '${scholarshipid}'`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      console.log(result);

      if (result != 0) {
        let data = DataModeling(result, "s_");

        //console.log(data);
        res.json(JsonDataResponse(data));
      } else {
        res.json(JsonDataResponse(result));
      }
    });
  } catch (error) {
    res.json(JsonErrorResponse(error));
  }
});


router.get("/load", (req, res) => {
  try {
    let sql = `SELECT
    s_scholarship_id,
    s_name,
    s_total_slots,
    s_available_slots,
    sc_max_slots as s_max_slots,
    DATE_FORMAT(s_start_date, '%Y-%m-%d') as s_start_date,
    DATE_FORMAT(s_end_date, '%Y-%m-%d') as s_end_date,
    s_status,
    DATE_FORMAT(sc_created_at, '%Y-%m-%d %H:%i:%s') as s_created_at
    FROM scholarship
    INNER JOIN scholarship_config`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      //console.log(result);

      if (result != 0) {
        let data = DataModeling(result, "s_");

        //console.log(data);
        res.json(JsonDataResponse(data));
      } else {
        res.json(JsonDataResponse(result));
      }
    });
  } catch (error) {
    console.log(error);
    res.json(JsonErrorResponse(error));
  }
});


router.put("/edit", (req, res) => {
  try {
    const { scholarshipid, name, startdate, enddate, status } = req.body;

    let data = [];
    let columns = [];
    let arguments = [];

    if (name) {
      data.push(name);
      columns.push("name");
    }

    if (startdate) {
      data.push(startdate);
      columns.push("start_date");
    }

    if (enddate) {
      data.push(enddate);
      columns.push("end_date");
    }

    if (status) {
      data.push(status);
      columns.push("status");
    }

    if (scholarshipid) {
      data.push(scholarshipid);
      arguments.push("scholarship_id");
    }

    let updateStatement = UpdateStatement(
      "scholarship",
      "s",
      columns,
      arguments
    );

    console.log(updateStatement);

    let checkStatement = SelectStatement(
      "select * from scholarship where s_scholarship_id = ? and s_name = ? and s_start_date = ? and s_end_date = ? and s_status = ?",
      [scholarshipid, name, startdate, enddate, status]
    );

    Check(checkStatement)
      .then((result) => {
        if (result != 0) {
          return res.json(JsonWarningResponse(MessageStatus.EXIST));
        } else {
          Update(updateStatement, data, (err, result) => {
            if (err) console.error("Error: ", err);

            //console.log(result);

            res.json(JsonSuccess());
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


router.get("/status", (req, res) => {
  try {
    let sql = `SELECT sp_status FROM signup_page WHERE sp_id = 1`;
    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      if (result.length > 0) {
        let data = DataModeling(result, "sp_");
        res.json(JsonDataResponse(data));
      } else {
        res.json(JsonDataResponse(result)); // Return empty if no data found
      }
    });
  } catch (error) {
    console.log(error);
    res.json(JsonErrorResponse(error));
  }
});

router.put("/status", (req, res) => {
  try {
    let id = 1;
    let status = req.body.status;
    let data = [status, id];

    let updateStatement = UpdateStatement(
      "signup_page",
      "sp",
      ["status"],
      ["id"]
    );

    Update(updateStatement, data, (err, result) => {
      if (err) {
        console.error("Error: ", err);
        res.json(JsonErrorResponse(err));
      } else {
        res.json(JsonSuccess());
      }
    });
  } catch (error) {
    console.log(error);
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