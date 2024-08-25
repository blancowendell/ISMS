const mysql = require("./repository/ismsdb");
//const moment = require('moment');
var express = require("express");
const { UserValidator } = require("./controller/middleware");
var router = express.Router();
//const currentDate = moment();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("studentindexlayout");
  UserValidator(req, res, "studentindexlayout");
});

module.exports = router;


router.get("/getbulletin", (req, res) => {
  try {
    let sql = `
     SELECT
    a_image AS image,
    a_tittle AS title,
    a_type as type,
    a_targerdate as targetdate,
    a_description AS description
    FROM announcements
    WHERE a_enddate >= CURDATE()
    AND a_status = 'Active'`;

    mysql
      .mysqlQueryPromise(sql)
      .then((result) => {
        if (result.length > 0) {
          res.status(200).json({
            msg: "success",
            data: result,
          });
        } else {
          res.status(404).json({
            msg: "no announcements today",
          });
        }
      })
      .catch((error) => {
        res.status(500).json({
          msg: "Error fetching department data",
          error: error,
        });
      });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});
