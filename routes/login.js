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
    const { username, password, accesstypeid } = req.body;

    Encrypter(password, (err, encrypted) => {
      if (err) console.error("Error: ", err);

      let sql = `SELECT 
          mu_employeeid AS employeeid,
          CONCAT(me_firstname, ' ', me_lastname) AS fullname,
          ma_accessname AS accesstype,
          mu_status AS status,
          me_profile_pic AS image,
          me_jobstatus AS jobstatus,
          md_departmentid AS departmentid,
          mu_isgeofence AS isgeofence,
          md_departmentname AS departmentname,
          mp_positionname AS position,
          ma_accessid AS accesstypeid,
          mgs_id AS geofenceid,
          (SELECT 
          GROUP_CONCAT(us_subgroupid) AS subgroupids
        FROM 
          user_subgroup
          WHERE 
          us_userid = (SELECT mu_userid 
                      FROM master_user 
                      WHERE mu_username = '${username}'
                      AND mu_password = '${encrypted}'
                      AND mu_accesstype = '${accesstypeid}')) as subgroupid
      FROM 
          master_user
      INNER JOIN 
          master_access ON mu_accesstype = ma_accessid
      LEFT JOIN 
          master_employee ON mu_employeeid = me_id
      LEFT JOIN 
          master_department ON md_departmentid = me_department
      LEFT JOIN 
          master_position ON mp_positionid = me_position
      LEFT JOIN 
          user_subgroup us ON mu_userid = us.us_userid
      LEFT JOIN master_geofence_settings ON mgs_departmentid = me_department 
      WHERE 
          mu_username = '${username}' 
          AND mu_password = '${encrypted}'
          AND mu_accesstype = '${accesstypeid}'
      GROUP BY 
          mu_employeeid,
          me_firstname,
          me_lastname,
          ma_accessname,
          mu_status,
          me_profile_pic,
          me_jobstatus,
          md_departmentid,
          mu_isgeofence,
          md_departmentname,
          mp_positionname,
          ma_accessid,
          mgs_id
      LIMIT 1`;

      mysql.mysqlQueryPromise(sql)
        .then((result) => {
          if (result.length !== 0) {
            const user = result[0];

            if (
              user.jobstatus === "probitionary" ||
              user.jobstatus === "regular" ||
              user.jobstatus === "apprentice"
            ) {
              if (user.status === "Active") {
                let data = UserLogin(result);

                data.forEach((user) => {
                  req.session.employeeid = user.employeeid;
                  req.session.fullname = user.fullname;
                  req.session.accesstype = user.accesstype;
                  req.session.image = user.image;
                  req.session.departmentid = user.departmentid;
                  req.session.isgeofence = user.isgeofence;
                  req.session.departmentname = user.departmentname;
                  req.session.position = user.position;
                  req.session.jobstatus = user.jobstatus;
                  req.session.geofenceid = user.geofenceid;
                  req.session.accesstypeid = user.accesstypeid;
                  req.session.subgroupid = user.subgroupid;
                });
                console.log('accesstype',req.session.accesstype);
                
                console.log(req.session.isgeofence,'data');
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
                msg: "resigned",
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




