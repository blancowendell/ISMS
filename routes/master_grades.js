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
const ExcelJS = require("exceljs");

/* GET home page. */
router.get("/", function (req, res, next) {
  Validator(req, res, "master_gradeslayout");
  //res.render('institutionslayout', { title: 'Express' });
});

module.exports = router;


router.get("/load", (req, res) => {
    try {
        let sql = `SELECT
        ms_studentid,
        CONCAT(ms_last_name,' ',ms_first_name,' ',ms_middle_name) as ms_fullname,
        ms_status,
        mi_name as ms_school,
        s_name as ms_scholarship,
        ms_first_sem_grade,
        ms_second_sem_grade 
        FROM master_students
        INNER JOIN master_institutions ON master_students.ms_institutionid = mi_institutionsid
        INNER JOIN scholarship ON master_students.ms_scholarshipid = s_scholarship_id`;

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
        console.log(error);
        res.json(JsonErrorResponse(error));
    }
});


router.post("/export", async (req, res) => {
    try {
      let schoolyear = req.body.schoolyear;
  
      let sql = `SELECT
        ms_studentid,
        CONCAT(ms_last_name,' ',ms_first_name,' ',ms_middle_name) as ms_fullname,
        ms_status,
        s_name as ms_scholarship,
        mi_name as ms_school,
        ms_first_sem_grade,
        ms_second_sem_grade 
        FROM master_students
        INNER JOIN master_institutions ON master_students.ms_institutionid = mi_institutionsid
        INNER JOIN scholarship ON master_students.ms_scholarshipid = s_scholarship_id
        WHERE ms_scholarshipid = '${schoolyear}'`;
  
      Select(sql, async (err, result) => {
        if (err) {
          console.error(err);
          res.json(JsonErrorResponse(err));
          return;
        }
  
        if (result.length > 0) {
  
          let s_name = result[3].ms_scholarship;
          
          let workbook = new ExcelJS.Workbook();
          let worksheet = workbook.addWorksheet("Students");
          worksheet.columns = [
            { header: "Applicant ID", key: "ms_studentid", width: 15 },
            { header: "Full Name", key: "ms_fullname", width: 40 },
            { header: "Status", key: "ms_status", width: 15 },
            { header: "School", key: "ms_school", width: 50 },
            { header: "Scholarship", key: "ms_scholarship", width: 20 },
            { header: "1st Sem Grade", key: "ms_first_sem_grade", width: 20 },
            { header: "2nd Sem Grade", key: "ms_second_sem_grade", width: 20 },
          ];
  
          worksheet.getRow(1).font = { bold: true };
          worksheet.getRow(1).alignment = {
            vertical: "middle",
            horizontal: "center",
          };
  
          result.forEach((row) => {
            worksheet.addRow(row);
          });
  
          worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
            row.alignment = { vertical: "middle", horizontal: "center" };
          });
  
          const filename = `Stidents_Grades_${s_name}.xlsx`;
  
          res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  
          await workbook.xlsx.write(res);
          res.end();
  
          await workbook.xlsx.write(res);
          res.end();
        } else {
          res.json(JsonDataResponse([]));
        }
      });
    } catch (error) {
      console.error(error);
      res.json(JsonErrorResponse(error));
    }
  });
  