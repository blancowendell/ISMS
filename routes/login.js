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