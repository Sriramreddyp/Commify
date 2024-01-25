const express = require("express");
const dotenv = require("dotenv");
const BodyParser = require("body-parser");
const app = express();

//**Database connectivity */
require("./DB/db.js");

//**Setting up parameters for the express app */
app.use(express.json());
app.use(BodyParser.urlencoded({ extended: true }));
dotenv.config();

//**Initial Route */
app.get("/", (req, res) => {
  res.json({
    status: "Welcome to Commify, Explore...Communicate...Collaborate",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`API listening on Port : ${process.env.PORT}`);
});
