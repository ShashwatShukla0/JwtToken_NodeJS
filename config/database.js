const mongoose = require("mongoose");

const { MONGO_URI } = process.env;

exports.connect = () => {
  //connection

  mongoose
    .connect(MONGO_URI)

    .then(() => {
      console.log("Successfully connected ");
    })

    .catch((error) => {
      console.log("Database Connection failed ");
      console.error(error);
      process.exit(1);
    });
};
