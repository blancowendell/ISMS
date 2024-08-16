const mysql = require("./repository/ismsdb");
//const moment = require('moment');
var express = require("express");
const { Validator } = require("./controller/middleware");
const { Select, InsertTable, Update } = require("./repository/dbconnect");
const { JsonErrorResponse, JsonDataResponse, JsonWarningResponse, MessageStatus, JsonSuccess } = require("./repository/response");
const { DataModeling } = require("./model/ismsdb");
const { InsertStatement, SelectStatement, GetCurrentDatetime, UpdateStatement } = require("./repository/customhelper");
var router = express.Router();
//const currentDate = moment();


router.get("/", function (req, res, next) {
  Validator(req, res, "announcementslayout");
  //res.render('institutionslayout', { title: 'Express' });
});

module.exports = router;

router.post("/getannouncement", (req, res) => {
  try {
    let bulletinid = req.body.bulletinid;
    let sql = `SELECT
    a_image as image,
    a_tittle as tittle,
    a_type as type,
    a_description as description,
    a_targerdate as targetdate,
    a_createby as createby,
    a_status as status
    FROM announcements
    WHERE a_announcementsid = '${bulletinid}'`;

    mysql
      .mysqlQueryPromise(sql)
      .then((result) => {
        res.json({
          msg: "success",
          data: result,
        });
      })
      .catch((error) => {
        res.json({
          msg: "error",
          data: error,
        });
      });
  } catch (error) {
    res.json({
      msg: "error",
      data: error,
    });
  }
});

router.get("/load", (req, res) => {
  try {
    let sql = "select * from announcements";

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      console.log(result);

      if (result != 0) {
        let data = DataModeling(result, "a_");

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


router.post("/save", (req, res) => {
  console.log("SAVE");
  try {
    let image = req.body.image;
    let tittle = req.body.tittle;
    let type = req.body.type;
    let targetdate = req.body.targetdate;
    let description = req.body.description;
    let createby = req.session.fullname;
    let createdate = GetCurrentDatetime();
    let status = "Active";

    console.log(image);
    

    let sql = InsertStatement("announcements", "a", [
      "image",
      "tittle",
      "type",
      "targerdate",
      "description",
      "createby",
      "createdate",
      "status",
    ]);

    console.log(sql);
    

    let data = [
      [
        image,
        tittle,
        type,
        targetdate,
        description,
        createby,
        createdate,
        status,
      ],
    ];

    console.log(data);
    
    let checkStatement = SelectStatement(
      "select * from announcements where a_tittle=? and a_type=? and a_targerdate=? and a_status",
      [tittle, type, targetdate, status]
    );

    Check(checkStatement)
      .then((result) => {
        console.log(result);
        if (result != 0) {
          return res.json(JsonWarningResponse(MessageStatus.EXIST));
        } else {
          InsertTable(sql, data, (err, result) => {
            if (err) {
              console.log(err);
              res.json(JsonErrorResponse(err));
            }

            res.json(JsonSuccess());
          });
        }
      })
      .catch((error) => {
        console.log(error);
        res.json(JsonErrorResponse(error));
      });
  } catch (error) {
    console.log(err);
    res.json(JsonErrorResponse(error));
  }
});



router.post("/update", (req, res) => {
  try {
    let bulletinid = req.body.bulletinid;
    let image = req.body.image;
    let tittle = req.body.tittle;
    let type = req.body.type;
    let targetdate = req.body.targetdate;
    let description = req.body.description;
    let createby = req.session.fullname;
    let status = req.body.status;


  } catch (error) {
    res.json({
      msg: "error",
    });
  }
});


router.put("/edit", (req, res) => {
  try {
    let bulletinid = req.body.bulletinid;
    let image = req.body.image;
    let tittle = req.body.tittle;
    let type = req.body.type;
    let targetdate = req.body.targetdate;
    let description = req.body.description;
    let createby = req.session.fullname;
    let status = req.body.status;

    let data = [];
    let columns = [];
    let arguments = [];

    if (image) {
      data.push(image);
      columns.push("image");
    }

    if (tittle) {
      data.push(tittle);
      columns.push("tittle");
    }

    if (type) {
      data.push(type);
      columns.push("type");
    }

    if (description) {
      data.push(description);
      columns.push("description");
    }

    if (createby) {
      data.push(createby);
      columns.push("createby");
    }


    if (status) {
      data.push(status);
      columns.push("status");
    }

    if (bulletinid) {
      data.push(bulletinid);
      arguments.push("announcementsid");
    }

    let updateStatement = UpdateStatement(
      "announcements",
      "a",
      columns,
      arguments
    );

    console.log(updateStatement);

    let checkStatement = SelectStatement(
      "select * from announcements where a_announcementsid = ? and a_tittle = ? and a_type = ? and a_status = ? and a_image = ?",
      [bulletinid, tittle, type, status, image]
    );

    Check(checkStatement)
      .then((result) => {
        if (result != 0) {
          return res.json(JsonWarningResponse(MessageStatus.EXIST));
        } else {
          Update(updateStatement, data, (err, result) => {
            if (err) console.error("Error: ", err);

            console.log(result);

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


router.post("/getnotif", (req, res) => {
  try {
    let employeeid = req.body.employeeid;
    let sql = `call hrmis.GetNotification('${employeeid}')`;

    mysql.StoredProcedure(sql, (err, result) => {
      if (err) console.log(err);
      console.log(result);
      res.json({
        msg: "success",
        data: result,
      });
    });
  } catch (error) {
    res.json({
      msg: "error",
      data: error,
    });
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
