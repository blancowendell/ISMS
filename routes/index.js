const mysql = require("./repository/ismsdb");
//const moment = require('moment');
var express = require("express");
const { Validator } = require("./controller/middleware");
const {
  JsonErrorResponse,
  JsonDataResponse,
} = require("./repository/response");
const { Select, Update, InsertTable } = require("./repository/dbconnect");
const { DataModeling } = require("./model/ismsdb");
var router = express.Router();
//const currentDate = moment();

/* GET home page. */
router.get("/", function (req, res, next) {
  Validator(req, res, "indexlayout");
});

module.exports = router;

router.get("/loadnewapplicants", (req, res) => {
  try {
    let sql = `SELECT 
    msr_image,
    CONCAT(msr_first_name,' ',msr_middle_name,' ',msr_last_name) as msr_fullname,
    msr_institutionid as msr_schoolname,
    msr_courseid as msr_corse_code
    FROM master_students_request
    WHERE msr_status = 'Applied'
    LIMIT 10`;

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

router.get("/loadtotal", (req, res) => {
  try {
    let sql = `SELECT COUNT(*) AS msr_TotalStudentsCount
    FROM master_students ms
    INNER JOIN scholarship s ON ms.ms_scholarshipid = s.s_scholarship_id
    WHERE s.s_status = 'Active'`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      if (result != 0) {
        let data = DataModeling(result, "msr_");
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

router.get("/loadpending", (req, res) => {
  try {
    let sql = `SELECT COUNT(*) AS msr_PendinApplication
    FROM master_students_request msr
    INNER JOIN scholarship s ON msr.msr_scholarshipid = s.s_scholarship_id
    WHERE msr.msr_status = 'Applied' AND s.s_status = 'Active'`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      if (result != 0) {
        let data = DataModeling(result, "msr_");
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

router.get("/loadverified", (req, res) => {
  try {
    let sql = `SELECT COUNT(*) AS msr_VerifiedStudentsCount
    FROM master_students ms
    INNER JOIN scholarship s ON ms.ms_scholarshipid = s.s_scholarship_id
    WHERE ms.ms_status = 'Verified' AND s.s_status = 'Active';
    `;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      if (result != 0) {
        let data = DataModeling(result, "msr_");
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

router.get("/loadperbarranggay", (req, res) => {
  try {
    let sql = `
    SELECT ms_baranggay, COUNT(*) AS ms_total_students
    FROM master_students
    WHERE ms_baranggay IS NOT NULL AND ms_baranggay != ''
    AND ms_status = 'Verified'
    GROUP BY ms_baranggay
    ORDER BY ms_total_students DESC`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      console.log(result);

      if (result != 0) {
        let data = DataModeling(result, "ms_");

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

router.get("/loadperschool", (req, res) => {
  try {
    let sql = `
    SELECT ms_institutionid, COUNT(*) AS ms_total_students
    FROM master_students
    WHERE ms_institutionid IS NOT NULL AND ms_institutionid != ''
    AND ms_status = 'Verified'
    GROUP BY ms_institutionid
    ORDER BY ms_total_students DESC`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      console.log(result);

      if (result != 0) {
        let data = DataModeling(result, "ms_");

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


router.get("/loadpercourse", (req, res) => {
  try {
    let sql = `
    SELECT ms_courseid, COUNT(*) AS ms_total_students
    FROM master_students
    WHERE ms_courseid IS NOT NULL AND ms_courseid != ''
    AND ms_status = 'Verified'
    GROUP BY ms_courseid
    ORDER BY ms_total_students DESC`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      console.log(result);

      if (result != 0) {
        let data = DataModeling(result, "ms_");

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
