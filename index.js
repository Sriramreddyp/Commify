// const express = require("express");
// const dotenv = require("dotenv");
// const BodyParser = require("body-parser");
// const app = express();
// const AuthRouter = require("./Routes/Auth.js");
// const ComRouter = require("./Routes/Community.js");
// const MemRouter = require("./Routes/Member.js");
// const RolesRouter = require("./Routes/Roles.js");
// const cookieparser = require("cookie-parser");
const app = require("./Utils/Server.js");

//**Database connectivity */
require("./DB/db.js");

//**Setting up middlewares for the express app */
// app.use(express.json());
// app.use(BodyParser.urlencoded({ extended: true }));
// app.use(cookieparser());
// dotenv.config();

//**Setting up Routers for different modules */
// app.use("/v1/role", RolesRouter);
// app.use("/v1/auth", AuthRouter);
// app.use("/v1/community", ComRouter);
// app.use("/v1/member", MemRouter);

//**Initial Route */
app.get("/", (req, res) => {
  res.json({
    status: "Welcome to Commify, Explore...Communicate...Collaborate",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`API listening on Port : ${process.env.PORT}`);
});
