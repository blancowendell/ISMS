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
  Validator(req, res, "institutionslayout");
  //res.render('institutionslayout', { title: 'Express' });
});

module.exports = router;

router.post("/loadcourses", (req, res) => {
  try {
    let institutionsid = req.body.institutionsid;
    let sql = `SELECT * FROM master_courses
    WHERE mc_institutionsid = '${institutionsid}'`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      //console.log(result);

      if (result != 0) {
        let data = DataModeling(result, "mc_");

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

router.get("/loadinstitutions", (req, res) => {
  try {
    let sql = `SELECT * FROM master_institutions`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      //console.log(result);

      if (result != 0) {
        let data = DataModeling(result, "mi_");

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
  try {
    const {
      institutionsname,
      institutionsaddress,
      institutionsphone,
      institutionsemail,
      image,
    } = req.body;

    let sql = InsertStatement("master_institutions", "mi", [
      "name",
      "address",
      "phone",
      "email",
      "image",
    ]);

    let data = [
      [
        institutionsname,
        institutionsaddress,
        institutionsphone,
        institutionsemail,
        image,
      ],
    ];
    let checkStatement = SelectStatement(
      "select * from master_institutions where mi_name=? and mi_address=?",
      [institutionsname, institutionsaddress]
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

router.post("/getinstitutions", (req, res) => {
  try {
    let institutionsid = req.body.institutionsid;
    let sql = `SELECT * FROM master_institutions
    WHERE mi_institutionsid = '${institutionsid}'`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      console.log(result);

      if (result != 0) {
        let data = DataModeling(result, "mi_");

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

router.put("/edit", (req, res) => {
  try {
    const { institutionsid, name, address, phone, email, image } = req.body;

    let data = [];
    let columns = [];
    let arguments = [];

    if (name) {
      data.push(name);
      columns.push("name");
    }

    if (address) {
      data.push(address);
      columns.push("address");
    }

    if (phone) {
      data.push(phone);
      columns.push("phone");
    }

    if (email) {
      data.push(email);
      columns.push("email");
    }

    if (image) {
      data.push(image);
      columns.push("image");
    }

    if (institutionsid) {
      data.push(institutionsid);
      arguments.push("institutionsid");
    }

    let updateStatement = UpdateStatement(
      "master_institutions",
      "mi",
      columns,
      arguments
    );

    console.log(updateStatement);

    let checkStatement = SelectStatement(
      "select * from master_institutions where mi_institutionsid = ? and mi_name = ? and mi_address = ?",
      [institutionsid, name, address]
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
