var roleacess = [
  {
    role: "ADMIN",
    routes: [
      {
        layout: "indexlayout",
      },
      // {
      //   layout: "ojtattendancelayout",
      // },
      // {
      //   layout: "ojtreqabsentlayout",
      // },
      // {
      //   layout: "ojtprofilelayout",
      // },
    ],
  },
];


exports.Validator = function (req, res, layout) {
  // console.log(layout);

  let ismatch = false;
  let counter = 0;
  // //console.log(roleacess.length)
  if (req.session.accesstype == "ADMIN" && layout == "indexlayout") {
    console.log("hit");
    return res.render(`${layout}`, {
      image: req.session.image,
      studentid: req.session.studentid,
      fullname: req.session.fullname,
      accesstype: req.session.accesstype,
      status: req.session.status,
    });
  } else {
    roleacess.forEach((key, item) => {
      counter += 1;
      var routes = key.routes;

      routes.forEach((value, index) => {
        // console.log(`${key.role} - ${value.layout}`);

        if (key.role == req.session.accesstype && value.layout == layout) {
          console.log("Role: ", req.session.accesstype, "Layout: ", layout);
          ismatch = true;

          return res.render(`${layout}`, {
            image: req.session.image,
            studentid: req.session.studentid,
            fullname: req.session.fullname,
            accesstype: req.session.accesstype,
            status: req.session.status,
          });
        }
      });

      if (counter == roleacess.length) {
        if (!ismatch) {
          res.redirect("/login");
        }
      }
    });
  }
};



