const express = require("express");
const RolesRouter = express.Router();
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const auth = require("../Utils/Authentication.js");
const comModel = require("../Models/CommunitySchema.js");
const memModel = require("../Models/MemberSchema.js");
const rolModel = require("../Models/RolesSchema.js");
const userModel = require("../Models/UserSchema.js");

module.exports = RolesRouter;
