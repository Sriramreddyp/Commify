const mongoose = require("mongoose");

//**Creating a Schema object */
const Schema = mongoose.Schema;

//**Defining Roles Schema Design */
const rolesSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: {
    type: String,
    required: true,
    default: null,
    validate: (value) => {
      if (value.length > 128)
        throw new Error("Name should not be more than 128 characters.");
    },
  },
  created_at: { type: datetime, required: true },
  updated_at: { type: datetime, required: true }, //? Should be updated each and every time when there is an update in this schema model
});

//**Creating Model for operation usage */
const rolesModel = new mongoose.model("rolesModel", rolesSchema);

module.exports = rolesModel;
