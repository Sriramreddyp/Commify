const express = require("express");
const dotenv = require("dotenv");
const BodyParser = require("body-parser");
const app = express();
const AuthRouter = require("./Routes/Auth.js");
const ComRouter = require("./Routes/Community.js");
const MemRouter = require("./Routes/Member.js");
const RolesRouter = require("./Routes/Roles.js");

//**Database connectivity */
require("./DB/db.js");

//**Setting up parameters for the express app */
app.use(express.json());
app.use(BodyParser.urlencoded({ extended: true }));
dotenv.config();

//**Setting up Routers for different modules */
app.use("/v1/role", RolesRouter);
app.use("/v1/auth", AuthRouter);
app.use("/v1/community", ComRouter);
app.use("/v1/member", MemRouter);

//**Initial Route */
app.get("/v1", (req, res) => {
  res.json({
    status: "Welcome to Commify, Explore...Communicate...Collaborate",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`API listening on Port : ${process.env.PORT}`);
});
