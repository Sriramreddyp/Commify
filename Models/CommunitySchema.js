const mongoose = require("mongoose");

//**Creating a Schema object */
const Schema = mongoose.Schema;

//**Defining Community Schema Design */
const communitySchema = new Schema({
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
  slug: {
    type: String,
    required: true,
    unique: true,
    validate: (value) => {
      if (value.length > 255)
        throw new Error("Slug should not be more than 255 characters.");
    },
  },
  owner: { type: String, required: true, unique: true },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true, default: Date.now }, //? Should be updated each and every time when there is an update in this schema model
});

//**Creating Model for operation usage */
const communityModel = new mongoose.model("communityModel", communitySchema);

module.exports = communityModel;
