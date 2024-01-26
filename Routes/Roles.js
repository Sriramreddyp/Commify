const express = require("express");
const RolesRouter = express.Router();
const { body, validationResult } = require("express-validator");
// const jwt = require("jsonwebtoken");
// const auth = require("../Utils/Authentication.js");
// const comModel = require("../Models/CommunitySchema.js");
// const memModel = require("../Models/MemberSchema.js");
const rolModel = require("../Models/RolesSchema.js");
// const userModel = require("../Models/UserSchema.js");
const uunid = require("@theinternetfolks/snowflake");

//**Route for adding appropriate roles */
RolesRouter.post(
  "/",
  [body("name", "Please enter valid role name").exists().isString()],
  async (req, res) => {
    try {
      //? Input Validation
      let errors = validationResult(req);
      if (!errors.isEmpty()) throw errors;

      //? Extracting Data
      let name = req.body.name;

      //? Genrating unique integer id
      let id = uunid.Snowflake.generate();

      //? Creating object as per schema model
      let obj = {
        id: id,
        name: name,
      };

      //? Creating a constructor
      let Role = new rolModel(obj);

      //? Inserting into database
      let response = await Role.save();

      //?For debugging purpose
      // console.log(response);

      if (response != null) {
        //?Creating ans formate obj
        let ans = {
          status: true,
          content: {
            data: {
              id: response.id,
              name: response.name,
              created_at: response.created_at,
              updated_at: response.updated_at,
            },
          },
        };

        //?Sending response
        res.json(ans);
      } else
        res.json({
          status: false,
          reason: "Response is not received..error in insertion",
        });
    } catch (err) {
      res.status(500).json({ status: false, reason: err });
    }
  }
);

//**Route for retriving all the roles*/
RolesRouter.get("/", async (req, res) => {
  try {
    let roles = [];
    //?Retriving all the documents
    roles = await rolModel.find().select({ _id: 0, __v: 0 });

    //? Test case check
    if (roles.length == 0) throw "Response is not received";

    // ? console.log(roles); For debugging purpose

    //?For meta data
    let noOfDoc = roles.length;
    let pages = Math.ceil(noOfDoc / 10);
    if (pages != 1) pages += noOfDoc % 10;

    //?Object creation
    let ans = {
      status: true,
      content: {
        meta: {
          total: noOfDoc,
          pages: pages,
          page: 1,
        },
        data: roles,
      },
    };

    res.json(ans);
  } catch (err) {
    res.status(500).json({ status: false, reason: err });
  }
});

module.exports = RolesRouter;
