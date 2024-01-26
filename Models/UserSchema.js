const mongoose = require("mongoose");

//**Creating a Schema object */
const Schema = mongoose.Schema;

//**Defining User Schema design */
const userSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: {
    type: String,
    required: true,
    default: null,
    validate: (value) => {
      if (value.length > 64)
        throw new Error("Name should not be more than 64 characters.");
    },
  },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: true,
    default: null,
    validate: (value) => {
      if (value.length > 64)
        throw new Error("password should not be more than 64 characters.");
    },
  },
  created_at: { type: Date, required: true, default: Date.now },
});

//**Creating Model for operation usage */
const UserModel = mongoose.model("UserModel", userSchema);

module.exports = UserModel;
