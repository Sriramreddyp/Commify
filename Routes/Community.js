const express = require("express");
const CommRouter = express.Router();
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const auth = require("../Utils/Authentication.js");
const comModel = require("../Models/CommunitySchema.js");
const memModel = require("../Models/MemberSchema.js");
const rolModel = require("../Models/RolesSchema.js");
const userModel = require("../Models/UserSchema.js");
const communityModel = require("../Models/CommunitySchema.js");
const uunid = require("@theinternetfolks/snowflake");

//**Route for creating a community */
//? retrive details of the logged user - id,name
//? create a community first with user id
//? create a member with the same user id and new community id with admin id
//! Should handle the case for deleting community if admin of that community is not created
CommRouter.post(
  "/",
  [body("name").exists().isString().isLength({ min: 2 })],
  async (req, res) => {
    try {
      //?Checking whether a particular user is logged in or not
      let userToken = req.cookies.access_token_user;
      console.log(userToken);
      if (!userToken) {
        res.status(401).json({ status: "can't access without authentication" });
        return;
      }

      //? Input Validation
      let errors = validationResult(req);
      if (!errors.isEmpty()) throw errors;

      let userData = {};
      //? JWT verification - nested try catch to handle token expiry case
      try {
        userData = jwt.verify(userToken, process.env.JWT_TOKEN_USER);
      } catch (err) {
        return res.status(500).json({ status: "JWT Expired" });
      }

      //?Extracting userData
      let userId = userData.id;

      //?Unique community id
      let uuid = uunid.Snowflake.generate();
      //?Slug Formation
      let slug = req.body.name.toLowerCase();

      //?Creating Community schema
      let obj = {
        id: uuid,
        name: req.body.name,
        slug: slug,
        owner: userId,
      };

      //?Creating constructor
      let community = new communityModel(obj);

      //?Acknowledgement for community creation
      let response = await community.save();

      console.log("Community Created!!");

      let memberId = uunid.Snowflake.generate();

      //?retriving admin id to assign admin role for the community created
      let adminID = await rolModel.findOne(
        { name: "Community Admin" },
        { id: 1, _id: 0 }
      );

      console.log(adminID);

      //?creating memeber schema
      let memObj = {
        id: memberId,
        community: community.id,
        user: userId,
        role: adminID.id,
      };

      //?Acknowledgement for member creation
      let member = new memModel(memObj);
      await member.save();

      console.log("Member Created!!");

      //?Sending response
      res.json({
        status: true,
        content: {
          data: {
            id: uuid,
            name: req.body.name,
            slug: slug,
            owner: userId,
            created_at: response.created_at,
            updated_at: response.updated_at,
          },
        },
      });
    } catch (err) {
      res.status(500).json({ status: false, reason: err });
    }
  }
);

//**Router inorder to get all the communities present */
//? check whether the logged in user is a member of any community or not
//? retrive community details - consolidate them,
//? retrive names for all the owners
//? create the data object
CommRouter.get("/", auth.authorizationUser, async (req, res) => {
  try {
    //? checking authorization of user
    let memCheck = await memModel.findOne({ user: req.id });

    if (!memCheck) {
      res.status(401).json({
        status: "No Authorization for this user to access community details",
      });
      return;
    }

    //?Retriving communites
    let communities = await comModel.find();
    if (!communities) throw "Error in retriving communities";

    //? console.log(communities); for debugging purpose

    //?For retriving names of the owners
    let names = [];
    for (let i = 0; i < communities.length; i++) {
      let name = await userModel.findOne(
        { id: communities[i].owner },
        { name: 1, _id: 0 }
      );
      names.push({ id: communities[i].id, name: name.name });
    }

    //?console.log(names); for debugging purpose

    //? for consolidating final data
    let data = [];
    for (let i = 0; i < communities.length; i++) {
      let obj = {
        id: communities[i].id,
        name: communities[i].name,
        slug: communities[i].slug,
        owner: {
          id: names[i].id,
          name: names[i].name,
        },
        created_at: communities[i].created_at,
        updated_at: communities[i].updated_at,
      };
      data.push(obj);
    }

    //? console.log(data); for debugging purpose

    //?Pagination details
    let noOfDoc = communities.length;
    let pages = Math.ceil(noOfDoc / 10);
    if (pages != 1) pages += noOfDoc % 10;

    //?Final response data
    res.json({
      status: true,
      content: {
        meta: {
          total: noOfDoc,
          pages: pages,
          page: 1,
        },
        data: data,
      },
    });
  } catch (err) {
    res.status(500).json({ status: false, reason: err });
  }
});

//** Route to retrive all the members from a particular community */
CommRouter.get("/:id/members", auth.authorizationUser, async (req, res) => {
  try {
    //? checking authorization of user
    let memCheck = await memModel.findOne({ user: req.id });

    if (!memCheck) {
      res.status(401).json({
        status: "No Authorization for this user to access community details",
      });
      return;
    }

    //?Getting details from params
    let communityName = req.params.id;

    //?Retriving id of the community
    let communityId = await communityModel.findOne(
      { name: communityName },
      { id: 1, _id: 0 }
    );
    if (!communityId)
      throw "Error in retriving members of the requried community";

    //? console.log(communityId); for debugging purpose

    //?Retriving members of the community
    let members = await memModel.find({ community: communityId.id });
    if (!members) throw "Error in retriving members of the requried community";

    //? console.log(members); for debugging purpose

    // //?For retriving names of the users
    let names = [];
    for (let i = 0; i < members.length; i++) {
      let name = await userModel.findOne(
        { id: members[i].user },
        { name: 1, _id: 0 }
      );
      names.push({ id: members[i].user, name: name.name });
    }

    //? console.log(names); for debugging purpose

    // //?For retriving names of the roles
    let roles = [];
    for (let i = 0; i < members.length; i++) {
      let name = await rolModel.findOne(
        { id: members[i].role },
        { name: 1, _id: 0 }
      );
      roles.push({ id: members[i].role, name: name.name });
    }

    //? console.log(roles); for debugging purpose

    // //? for consolidating final data
    let data = [];
    for (let i = 0; i < members.length; i++) {
      let obj = {
        id: members[i].id,
        community: members[i].community,
        user: {
          id: names[i].id,
          name: names[i].name,
        },
        role: {
          id: roles[i].id,
          name: roles[i].name,
        },
        created_at: members[i].created_at,
      };
      data.push(obj);
    }

    //? console.log(data); for debugging purpose

    // //?Pagination details
    let noOfDoc = members.length;
    let pages = Math.ceil(noOfDoc / 10);
    if (pages != 1) pages += noOfDoc % 10;

    // //?Final response data
    res.json({
      status: true,
      content: {
        meta: {
          total: noOfDoc,
          pages: pages,
          page: 1,
        },
        data: data,
      },
    });
  } catch (err) {
    res.status(500).json({ status: false, reason: err });
  }
});

//** Route for retriving communities belonged to the logged in user */
CommRouter.get("/me/owner", auth.authorizationUser, async (req, res) => {
  try {
    //? Retriving communities belonged to this user
    let communities = await comModel.find(
      { owner: req.id },
      { _id: 0, __v: 0 }
    );

    //? console.log(communities); for debugging purpose

    // //?Pagination details
    let noOfDoc = communities.length;
    let pages = Math.ceil(noOfDoc / 10);
    if (pages != 1) pages += noOfDoc % 10;

    // //?Final response data
    res.json({
      status: true,
      content: {
        meta: {
          total: noOfDoc,
          pages: pages,
          page: 1,
        },
        data: communities,
      },
    });
  } catch (err) {
    res.status(500).json({ status: false, reason: err });
  }
});

//** Route to Retrive all the joined communities of a particular user */
//? retrive all the members with the logged in user
//? retrive all the community id's from the members
//? retrive all the communities
//?retrive all the owner names from users
//?consolidate the obj
CommRouter.get("/me/member", auth.authorizationUser, async (req, res) => {
  try {
    //?Retrive all the members as logged in user
    let members = await memModel.find({ user: req.id }, { _id: 0, __v: 0 });

    //? Retriving communities from the members list
    let communities = [];
    for (let i = 0; i < members.length; i++) {
      let community = await comModel.findOne(
        { id: members[i].community },
        { _id: 0, __v: 0 }
      );
      communities.push(community);
    }

    //? console.log(communities); for debugging purpose

    // //?For retriving names of the users
    let names = [];
    for (let i = 0; i < communities.length; i++) {
      let name = await userModel.findOne(
        { id: communities[i].owner },
        { name: 1, _id: 0 }
      );
      names.push({ id: communities[i].owner, name: name.name });
    }

    // ? console.log(names); for debugging purpose

    // //?Pagination details
    let noOfDoc = communities.length;
    let pages = Math.ceil(noOfDoc / 10);
    if (pages != 1) pages += noOfDoc % 10;

    //? for consolidating final data
    let data = [];
    for (let i = 0; i < communities.length; i++) {
      let obj = {
        id: communities[i].id,
        name: communities[i].name,
        slug: communities[i].slug,
        owner: {
          id: names[i].id,
          name: names[i].name,
        },
        created_at: communities[i].created_at,
        updated_at: communities[i].updated_at,
      };
      data.push(obj);
    }

    // ? console.log(data) for debugging purpose;

    //?Final response data
    res.json({
      status: true,
      content: {
        meta: {
          total: noOfDoc,
          pages: pages,
          page: 1,
        },
        data: data,
      },
    });
  } catch (err) {
    res.status(500).json({ status: false, reason: err });
  }
});
module.exports = CommRouter;
