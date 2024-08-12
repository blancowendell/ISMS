const { Encrypter } = require("./repository/crytography");
const { UserLogin, AdminLogin } = require("./repository/helper");
const mysql = require("./repository/ismsdb");
//const moment = require('moment');
var express = require("express");
//const { Validator } = require("./controller/middleware");
var router = express.Router();
//const currentDate = moment();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('adminloginlayout', { title: 'Express' });
  });
  
module.exports = router;


router.post("/login", (req, res) => {
  try {
    const { username, password, accesstypeid } = req.body;
    

    Encrypter(password, (err, encrypted) => {
      if (err) console.error("Error: ", err);

      let sql = `SELECT
      au_userid AS userid,
      au_fullname AS fullname,
      ma_accessname AS accesstype,
      au_status AS status,
      au_image AS image
      FROM admin_user
      INNER JOIN master_access ON admin_user.au_accesstype = ma_accessid
      WHERE au_username = '${username}'
      AND au_password = '${encrypted}'
      AND au_accesstype = '${accesstypeid}'`;

      mysql.mysqlQueryPromise(sql)
        .then((result) => {
          if (result.length !== 0) {
            const user = result[0];

            console.log(result);
            

            if (
              user.status === "Active"
            ) {
              let data = AdminLogin(result);
                data.forEach((user) => {
                  req.session.userid = user.userid;
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
                msg: "inactive",
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




