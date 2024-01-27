const mongoose = require("mongoose");
require("dotenv").config();

//** Establishing Connection with Local MongoDB */
mongoose.connect(process.env.MONGO_DB_URI);

//**Checking the authenticity of the connection */
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error :")); //? Error Generated

db.once("open", () => {
  console.log("connected Sucessfully!!"); //?Msg upon Successfull connection
});
