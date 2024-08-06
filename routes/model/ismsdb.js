const { OJTAttendanceModel, DataModel, RawDataModel } = require("./model");

exports.DataModeling = (data, prefix) => {
  let result = [];

  data.forEach((d) => {
    result.push(new DataModel(d, prefix));
  });

  return result;
};

exports.RawData = (data) => {
  let result = [];

  data.forEach((d) => {
    result.push(new RawDataModel(d));
  });
  return result;
};

//#region Remodeling

exports.OJTAttendance = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.id,
      date: key.date,
      time: key.time,
      latitude: key.latitude,
      longitude: key.longitude,
      device: key.device,
      geofenceid: key.geofenceid
    });
  });

  return dataResult.map(
    (key) =>
      new OJTAttendanceModel(
        key["id"],
        key["date"],
        key["time"],
        key["latitude"],
        key["longitude"],
        key["device"],
        key[' geofenceid']
      )
  );
};
//#endregion
