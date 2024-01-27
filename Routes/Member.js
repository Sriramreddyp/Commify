const express = require("express");
const MemRouter = express.Router();
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const auth = require("../Utils/Authentication.js");
const comModel = require("../Models/CommunitySchema.js");
const memModel = require("../Models/MemberSchema.js");
const rolModel = require("../Models/RolesSchema.js");
const userModel = require("../Models/UserSchema.js");
const uunid = require("@theinternetfolks/snowflake");

//**Route for addding members into the community by community Admin */

//? logged in user can only add users where the logged in user is admin
MemRouter.post(
  "/",
  [
    body("community").exists().isString(),
    body("user").exists().isString(),
    body("role").exists().isString(),
  ],
  async (req, res) => {
    try {
      //?Checking whether a particular user is logged in or not
      let userToken = req.cookies.access_token_user;

      //? console.log(userToken); for debugging purpose

      if (!userToken) {
        res.status(401).json({ status: "can't access without authentication" });
        return;
      }

      let userData = {};
      //? JWT verification - nested try catch to handle token expiry case
      try {
        userData = jwt.verify(userToken, process.env.JWT_TOKEN_USER);
      } catch (err) {
        return res.status(500).json({ status: "JWT Expired" });
      }

      //?  console.log(userData.id); for debugging purpose

      //?Retrive that particular document from members where the given user is an admin for the given community
      let permissionCheck = await memModel.findOne(
        {
          community: req.body.community,
          user: userData.id,
        },
        { _id: 0, __v: 0 }
      );

      //? console.log(permissionCheck); for debugging purpose

      if (permissionCheck) {
        //? retrive roleName
        let role = await rolModel.findOne(
          { id: permissionCheck.role },
          { _id: 0, name: 1 }
        );
        console.log(role.name);
        if (role.name == "member")
          res.status(401).json({
            status:
              "Not authorized to add or create members in that community..",
          });
        return;
      }

      //?Unique id for member document
      let uuid = uunid.Snowflake.generate();

      //?Creating schema for member
      let obj = {
        id: uuid,
        community: req.body.community,
        user: req.body.user,
        role: req.body.role,
      };

      //?Creating constructor
      let member = new memModel(obj);

      //? creating document
      let response = await member.save();

      //?Response
      res.json({
        status: true,
        content: {
          data: {
            id: response.id,
            community: response.community,
            user: response.user,
            role: response.role,
            created_at: response.created_at,
          },
        },
      });
    } catch (err) {
      res.status(500).json({ status: false, reason: err });
    }
  }
);

//**Route for deleting members from the community by community Admin if the user is community admin */
//? Retrive community first from the id
//? check if the user logged in is a admin or moderator of that community
//? if yes delete the member

MemRouter.delete("/:id", async (req, res) => {
  try {
    //?Checking whether a particular user is logged in or not
    let userToken = req.cookies.access_token_user;

    //? console.log(userToken); for debugging purpose

    if (!userToken) {
      res.status(401).json({ status: "can't access without authentication" });
      return;
    }

    let userData = {};
    //? JWT verification - nested try catch to handle token expiry case
    try {
      userData = jwt.verify(userToken, process.env.JWT_TOKEN_USER);
    } catch (err) {
      return res.status(500).json({ status: "JWT Expired" });
    }

    //? Retriving community from the given id
    let community = await memModel.findOne(
      { id: req.params.id },
      { _id: 0, community: 1 }
    );

    if (community == null) throw "Member dosen't exist..";

    console.log(community);

    //?Retrive that particular document from members where the given user is an admin for the given community
    let permissionCheck = await memModel.findOne(
      {
        community: community.community,
        user: userData.id,
      },
      { _id: 0, __v: 0 }
    );

    console.log(permissionCheck);

    if (!permissionCheck) {
      //? retrive roleName
      let role = await rolModel.findOne(
        { id: permissionCheck.role },
        { _id: 0, name: 1 }
      );
      if (role.name == "member")
        res.status(401).json({
          status: "Not authorized to add or create members in that community..",
        });
      return;
    }

    // //? deleting member
    await memModel.findOneAndDelete({ id: req.params.id });

    res.json({ status: true });
  } catch (err) {
    res.status(500).json({ status: false, reason: err });
  }
});

module.exports = MemRouter;
