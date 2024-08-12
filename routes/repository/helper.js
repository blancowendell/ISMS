exports.generateUsernameAndPassword = (employee) => {
  try {
    const {
      me_id: employeeid,
      me_firstname: firstname,
      me_lastname: lastname,
      me_birthday: birthday,
    } = employee;

    // const username = (firstname.charAt(0) + lastname).toLowerCase();

    // const password = employeeid + birthday.replace(/-/g, "");

    function sanitizeName(name) {
      return name.replace(/\s+/g, '').replace(/(jr|sr)$/i, '');
    }

    const sanitizedFirstname = sanitizeName(firstname.charAt(0).toLowerCase());
    const sanitizedLastname = sanitizeName(lastname.toLowerCase());


    const username = sanitizedFirstname + sanitizedLastname;
    const password = employeeid + birthday.replace(/-/g, "");

    return { username, password };
  } catch (error) {
    console.log(error);
  }
};

// exports.generateUsernameAndPasswordforemployee = (employee) => {
//   try {
//     const {
//       me_id: newEmployeeId,
//       me_firstname: firstname,
//       me_lastname: lastname,
//       me_birthday: birthday,
//     } = employee;

//     const username = firstname.toLowerCase() + lastname.charAt(0).toLowerCase();

//     const password = newEmployeeId + birthday.replace(/-/g, "");

//     return { username, password };
//   } catch (error) {
//     console.log(error);
//   }
// };

exports.generateUsernameAndPasswordforemployee = (employee) => {
  try {
    const {
      me_id: newEmployeeId,
      me_firstname: firstname,
      me_lastname: lastname,
      me_birthday: birthday,
    } = employee;

    function sanitizeName(name) {
      return name.replace(/\s+/g, '').replace(/(jr|sr)$/i, '');
    }

    const sanitizedFirstname = sanitizeName(firstname.charAt(0).toLowerCase());
    const sanitizedLastname = sanitizeName(lastname.toLowerCase());


    const username = sanitizedFirstname + sanitizedLastname;
    const password = newEmployeeId + birthday.replace(/-/g, "");

    return { username, password };
  } catch (error) {
    console.log(error);
  }
};



exports.generateUsernameAndPasswordForApprentice = (apprentice) => {
  try {
    const {
      apprentice_id: newApprenticeId,
      apprentice_firstname: firstname,
      apprentice_lastname: lastname,
      apprentice_birthday: birthday,
    } = apprentice;

    // Generate username by combining the first name and the first letter of the last name
    const username = firstname.charAt(0).toLowerCase() + lastname.toLowerCase();

    // Generate the password by combining apprentice id and birthday
    const password = newApprenticeId + birthday.replace(/-/g, "");

    return { username, password };
  } catch (error) {
    console.log(error);
  }
};

exports.generateUsernamefoApplicant = (applicant) => {
  try {
    const { map_applicantid: newApplicantId, map_nickname: nickname } =
      applicant;

    const username = nickname.toLowerCase() + newApplicantId;

    return { username };
  } catch (error) {
    console.log(error);
  }
};

exports.UserLogin = (result, callback) => {
  try {
    const userData = [];

    result.forEach((row) => {
      userData.push({
        studentid: row.studentid,
        fullname: row.fullname,
        accesstype: row.accesstype,
        status: row.status,
        image: row.image,
      });
    });

    return userData;
  } catch (error) {
    console.log(error);
    callback(error);
  }
};

exports.AdminLogin = (result, callback) => {
  try {
    const AdminData = [];

    result.forEach((row) => {
      AdminData.push({
        userid: row.userid,
        fullname: row.fullname,
        accesstype: row.accesstype,
        status: row.status,
        image: row.image,
      });
    });

    return AdminData;
  } catch (error) {
    console.log(error);
    callback(error);
  }
};

exports.showSweetAlert = (title, text, icon, buttonText) => {
  try {
    swal({
      title: title,
      text: text,
      icon: icon,
      button: buttonText,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.generateUsernameAndPasswordforOjt = (ojt) => {
  try {
    const {
      mo_name: firstname,
      mo_lastname: lastname,
      mo_id: ojtID,
      mo_birthday: birthday,
    } = ojt;

    // Generate username by combining the first name and the first letter of the last name
    const username = firstname.toLowerCase() + lastname.charAt(0).toLowerCase();

    // Generate the password by combining employee id and birthday
    const password = ojtID + birthday.replace(/-/g, "");

    return { username, password };
  } catch (error) {
    console.log(error);
  }
};

// Example of how to use the custom function:
// showSweetAlert("success", "Log in Successfully", "success", "Let's go!");
// showSweetAlert("incorrect", "Incorrect Credentials. Please try again!", "error", "AWW NO!!!");
