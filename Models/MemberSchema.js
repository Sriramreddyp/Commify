const mongoose = require("mongoose");

//**Creating a Schema object */
const Schema = mongoose.Schema;

//**Defining member Schema Design */
const memberSchema = new Schema({
  id: { type: String, required: true, unique: true },
  community: { type: String, required: true, unique: false },
  user: { type: String, required: true, unique: false },
  role: { type: String, required: true, unique: false },
  created_at: { type: Date, required: true, default: Date.now },
});

//**Creating Model for operation usage */
const memberModel = new mongoose.model("memberModel", memberSchema);

module.exports = memberModel;
