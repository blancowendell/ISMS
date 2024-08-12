const { Encrypter } = require("./repository/crytography");
const { UserLogin } = require("./repository/helper");
const mysql = require("./repository/ismsdb");
//const moment = require('moment');
var express = require("express");
//const { Validator } = require("./controller/middleware");
var router = express.Router();
//const currentDate = moment();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('loginlayout', { title: 'Express' });
  });
  
module.exports = router;


router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    console.log(req.body);
    

    Encrypter(password, (err, encrypted) => {
      if (err) console.error("Error: ", err);
      let sql = `SELECT
      mu_studentid AS studentid,
      CONCAT(ms_last_name,' ',ms_first_name) AS fullname,
      ma_accessname AS accesstype,
      ms_status AS status,
      ms_image AS image
      FROM master_user
      INNER JOIN master_students ON master_user.mu_studentid = ms_studentid
      INNER JOIN master_access ON master_user.mu_accesstypeid = ma_accessid
      WHERE mu_username = '${username}'
      AND mu_password = '${encrypted}'`;

      console.log(sql);
      

      mysql.mysqlQueryPromise(sql)
        .then((result) => {
          if (result.length !== 0) {
            const user = result[0];

            console.log(result,'result');
            

            if (
              user.status === "UnVerified" || user.status === "Verified"
            ) {
              let data = UserLogin(result);
                data.forEach((user) => {
                  req.session.studentid = user.studentid;
                  req.session.fullname = user.fullname;
                  req.session.accesstype = user.accesstype;
                  req.session.status = user.status;
                  req.session.image = user.image;
                });
                console.log('accesstype',req.session.accesstype);
                return res.json({
                  msg: "success",
                  data: data,
                });
            } else {
              return res.json({
                msg: "graduated",
              });
            }
          } else {
            return res.json({
              msg: "incorrect",
            });
          }
        })
        .catch((error) => {
          return res.json({
            msg: "error",
            data: error,
          });
        });
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});


router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err)
      res.json({
        msg: err,
      });
    res.json({
      msg: "success",
    });
  });
});




