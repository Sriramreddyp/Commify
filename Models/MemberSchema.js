const mongoose = require("mongoose");

//**Creating a Schema object */
const Schema = mongoose.Schema;

//**Defining member Schema Design */
const memberSchema = new Schema({
  id: { type: String, required: true, unique: true },
  community: { type: String, required: true, unique: true },
  user: { type: String, required: true, unique: true },
  role: { type: String, required: true, unique: true },
  created_at: { type: datetime, required: true },
});

//**Creating Model for operation usage */
const memberModel = new mongoose.model("memberModel", memberSchema);

module.exports = memberModel;
