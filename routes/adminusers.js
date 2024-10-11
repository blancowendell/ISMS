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
const { Encrypter, Decrypter } = require("./repository/crytography");
var router = express.Router();


/* GET home page. */
router.get("/", function (req, res, next) {
    Validator(req, res, "adminuserslayout");
});

module.exports = router;


router.get("/load", (req, res) => {
  try {
    let sql = `SELECT 
    au_image,
    au_userid,
    au_fullname,
    ma_accessname as au_accessname,
    au_username,
    au_status,
    au_createby,
    au_createdate
    FROM admin_user
    INNER JOIN master_access ON admin_user.au_accesstype = ma_accessid`;

    Select(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json(JsonErrorResponse(err));
      }

      //console.log(result);

      if (result != 0) {
        let data = DataModeling(result, "au_");

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

// router.post("/save", async (req, res) => {
//     try {
//     //   const { studentid } = req.body;
//       let image = req.body.image;
//       let fullname = req.body.fullname;
//       let username = req.body.username;
//       let password = req.body.password;
//       let email = req.body.email;
//       let status = "Active";
//       let accesstype = req.body.accesstype;
//       const createdate = GetCurrentDatetime();
//       let createby = req.session.fullname;
  
//       Encrypter(password, async (err, encrypted) => {
//         if (err) {
//           console.error("Error: ", err);
//           res.json({ msg: "error" });
//         } else {
//           let sql = InsertStatement("admin_user", "au", [
//             "image",
//             "fullname",
//             "accesstype",
//             "username",
//             "password",
//             "status",
//             "createby",
//             "createdate",
//             "email",
//           ]);
  
//           let data = [[image, fullname, accesstype, username, encrypted, status, createby, createdate, email]];
//           let checkStatement = SelectStatement(
//             "select * from  admin_user where au_fullname=? and au_accesstype=? and au_status=?",
//             [fullname, accesstype, status]
//           );
//           Check(checkStatement)
//           .then((result) => {
//             console.log(result);
//             if (result != 0) {
//               return res.json(JsonWarningResponse(MessageStatus.EXIST));
//             } else {
//               InsertTable(sql, data, (err, result) => {
//                 if (err) {
//                   console.log(err);
//                   res.json(JsonErrorResponse(err));
//                 }
  
//                 res.json(JsonSuccess());
//               });
//             }
//           })
//         .catch((error) => {
//           console.log(error);
//           res.json(JsonErrorResponse(error));
//         });
//         }
//       });
//     } catch (error) {
//       console.error("Error: ", error);
//       res.json({ msg: "error" });
//     }
//   });

router.post("/save", async (req, res) => {
  try {
    let image = req.body.image;
    let fullname = req.body.fullname;
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let status = "Active";
    let accesstype = req.body.accesstype;
    const createdate = GetCurrentDatetime();
    let createby = req.session.fullname;

    Encrypter(password, async (err, encrypted) => {
      if (err) {
        console.error("Error: ", err);
        res.json({ msg: "error" });
      } else {
        // Check for existing fullname
        let checkFullnameStatement = SelectStatement(
          "SELECT * FROM admin_user WHERE au_fullname=? AND au_accesstype=? AND au_status=?",
          [fullname, accesstype, status]
        );

        // Check for existing email
        let checkEmailStatement = SelectStatement(
          "SELECT * FROM admin_user WHERE au_email=?",
          [email]
        );

        // Execute both checks in parallel
        const [fullnameCheck, emailCheck] = await Promise.all([
          Check(checkFullnameStatement),
          Check(checkEmailStatement)
        ]);

        if (fullnameCheck.length > 0) {
          return res.json(JsonWarningResponse(MessageStatus.EXIST)); // Fullname exists
        }

        if (emailCheck.length > 0) {
          return res.json(JsonWarningResponse("Email already exists")); // Email exists
        }

        // Proceed to insert new record
        let sql = InsertStatement("admin_user", "au", [
          "image",
          "fullname",
          "accesstype",
          "username",
          "password",
          "status",
          "createby",
          "createdate",
          "email",
        ]);

        let data = [[image, fullname, accesstype, username, encrypted, status, createby, createdate, email]];
        
        InsertTable(sql, data, (err, result) => {
          if (err) {
            console.log(err);
            return res.json(JsonErrorResponse(err));
          }

          res.json(JsonSuccess());
        });
      }
    });
  } catch (error) {
    console.error("Error: ", error);
    res.json({ msg: "error" });
  }
});



router.put("/status", (req, res) => {
  try {
    let id = req.body.id;
    let status =
      req.body.status == GetValue(ACT()) ? GetValue(INACT()) : GetValue(ACT());
    let data = [status, id];

    let updateStatement = UpdateStatement(
      "master_access_route_layout",
      "marl",
      ["status"],
      ["id"]
    );

    Update(updateStatement, data, (err, result) => {
      if (err) {
        console.error("Error: ", err);
        res.json(JsonErrorResponse(err));
      }

      res.json(JsonSuccess());
    });
  } catch (error) {
    console.log(error);
    res.json(JsonErrorResponse(error));
  }
});

// router.post("/getadminusers", (req, res) => {
//   try {
//     let userid = req.body.userid;
//     let sql = `SELECT 
//       au_userid,
//       ma_accessname as au_accessname,
//       au_fullname,
//       au_username,
//       au_password,
//       au_status,
//       au_image
//     FROM admin_user
//     INNER JOIN master_access ON admin_user.au_accesstype = ma_accessid
//     WHERE au_userid = '${userid}'`;

//     Select(sql, (err, result) => {
//       if (err) {
//         console.error(err);
//         res.json(JsonErrorResponse(err));
//       }

//       //console.log(result);

//       if (result != 0) {
//         let data = DataModeling(result, "au_");

//         //console.log(data);
//         res.json(JsonDataResponse(data));
//       } else {
//         res.json(JsonDataResponse(result));
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.json(JsonErrorResponse(error));
//   }
// });

router.post("/getadminusers", (req, res) => {
  try {
      let userid = req.body.userid;

      console.log(userid);
      
      let sql = `SELECT 
          au_userid,
          au_accesstype,
          au_fullname,
          au_email,
          au_username,
          au_password,
          au_status,
          au_image
      FROM admin_user
      WHERE au_userid = '${userid}'`;

      console.log(sql);
      

      Select(sql, (err, result) => {
          if (err) {
              console.error(err);
              return res.json(JsonErrorResponse(err));
          }

          if (result.length > 0) {
              let user = result[0];
              console.log("Result before decryption:", result);
              Decrypter(user.au_password, (decryptErr, decryptedPassword) => {
                  if (decryptErr) {
                      console.error(decryptErr);
                      return res.json(JsonErrorResponse(decryptErr));
                  }
                  user.au_password = decryptedPassword;
                  
                  console.log("Result after decryption:", result);

                  let data = DataModeling([user], "au_");
                  res.json(JsonDataResponse(data));
              });
          } else {
              res.json(JsonDataResponse(result));
          }
      });
  } catch (error) {
      console.error(error);
      res.json(JsonErrorResponse(error));
  }
});


router.put("/edit", (req, res) => {
  try {
    const {
      userid,
      accesstype,
      fullname,
      username,
      status,
      email,
      newpassword,
      image,
    } = req.body;

    let data = [];
    let columns = [];
    let arguments = [];

    if (accesstype) {
      data.push(accesstype);
      columns.push("accesstype");
    }

    if (fullname) {
      data.push(fullname);
      columns.push("fullname");
    }

    if (username) {
      data.push(username);
      columns.push("username");
    }

    if (email) {
      data.push(email);
      columns.push("email");
    }

    if (status) {
      data.push(status);
      columns.push("status");
    }

    if (image) {
      data.push(image);
      columns.push("image");
    }

    if (newpassword) {
      // Encrypt the new password before insertion
      Encrypter(newpassword, (encryptErr, encryptedPassword) => {
        if (encryptErr) {
          console.error("Encryption Error: ", encryptErr);
          return res.json(JsonErrorResponse(encryptErr));
        }

        data.push(encryptedPassword);
        columns.push("password");
      });
    }

    if (userid) {
      data.push(userid);
      arguments.push("userid");
    }

    let updateStatement = UpdateStatement(
      "admin_user",
      "au",
      columns,
      arguments
    );

    console.log(updateStatement);

    let checkStatement = SelectStatement(
      "select * from admin_user where au_email = ?",
      [email]
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

    // Update(updateStatement, data, (updateErr, updateResult) => {
    //   if (updateErr) {
    //     console.error("Update Error: ", updateErr);
    //     return res.json(JsonErrorResponse(updateErr));
    //   }

    //   res.json(JsonSuccess());
    // });
  } catch (error) {
    console.error(error);
    res.json(JsonErrorResponse(error));
  }
});


// router.put("/edit", (req, res) => {
//   try {
//     const { userid, accesstype, fullname, username, status, currentpassword, newpassword } = req.body;

//     let data = [];
//     let columns = [];
//     let arguments = [];

//     if (accesstype) {
//       data.push(accesstype);
//       columns.push("accesstype");
//     }

//     if (fullname) {
//       data.push(fullname);
//       columns.push("fullname");
//     }

//     if (username) {
//       data.push(username);
//       columns.push("username");
//     }

//     if (status) {
//       data.push(status);
//       columns.push("status");
//     }

//     if (password) {
//       data.push(password);
//       columns.push("password");
//     }

//     if (userid) {
//       data.push(userid);
//       arguments.push("userid");
//     }

//     let updateStatement = UpdateStatement(
//       "admin_user",
//       "au",
//       columns,
//       arguments
//     );

//     console.log(updateStatement);

//     let checkStatement = SelectStatement(
//       "select * from admin_user where au_userid = ? and au_accesstype = ? and au_status = ?",
//       [userid, accesstype, status]
//     );

//     Check(checkStatement)
//       .then((result) => {
//         if (result != 0) {
//           return res.json(JsonWarningResponse(MessageStatus.EXIST));
//         } else {
//           Update(updateStatement, data, (err, result) => {
//             if (err) console.error("Error: ", err);

//             //console.log(result);

//             res.json(JsonSuccess());
//           });
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//         res.json(JsonErrorResponse(error));
//       });
//   } catch (error) {
//     console.log(error);
//     res.json(JsonErrorResponse(error));
//   }
// });

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

