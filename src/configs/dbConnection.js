"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | HOTEL API
------------------------------------------------------- */
// MongoDB Connection:

const mongoose = require("mongoose");

const dbConnection = () => {
  // Connect
  mongoose
    .connect(process.env.MONGODB)
    .then(() => console.log("* DB Connected"))
    .catch((err) => console.log("* DB Not Connected"));
};

module.exports = {
  mongoose,
  dbConnection,
};
