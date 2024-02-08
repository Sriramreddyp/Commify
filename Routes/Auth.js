const express = require("express");
const AuthRouter = express.Router();
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const auth = require("../Utils/Authentication.js");
const comModel = require("../Models/CommunitySchema.js");
const memModel = require("../Models/MemberSchema.js");
const rolModel = require("../Models/RolesSchema.js");
const userModel = require("../Models/UserSchema.js");
const uunid = require("@theinternetfolks/snowflake");
const bcrypt = require("bcryptjs");
const UserModel = require("../Models/UserSchema.js");

//**Test Route */
AuthRouter.get("/", (req, res) => {
  res.json({ status: "Test Sucessfull" });
});

//** Signup endpoint for user */
AuthRouter.post(
  "/signup",
  [
    body("name").exists().isString().isLength({ min: 2 }),
    body("email")
      .exists()
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
    body("password")
      .exists()
      .isLength({ min: 6 })
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      ),
  ],
  async (req, res) => {
    try {
      //? Input Validation
      let errors = validationResult(req);
      if (!errors.isEmpty()) throw errors;

      //?Generating unique id for newUser
      let uuid = uunid.Snowflake.generate();

      //?Hashing the password
      const salt = await bcrypt.genSalt(10);
      const securePass = await bcrypt.hash(req.body.password, salt);

      //?Creating schema for userModel
      let obj = {
        id: uuid,
        name: req.body.name,
        email: req.body.email,
        password: securePass,
      };

      //? Creating Constructor
      let user = new UserModel(obj);

      //?Retriving ack response
      let response = await user.save();

      //? console.log(response); For debugging purpose

      //?Token and cookie generation
      jwt.sign(
        { name: req.body.name, email: req.body.email, id: uuid },
        process.env.JWT_TOKEN_USER,
        { expiresIn: "60m" },
        (err, token) => {
          if (err)
            throw "Internal Server Error, Please try again after sometime (Token generation issue)";

          //? console.log(token); for debugging purpose

          //? Creating response object
          let ans = {
            status: true,
            content: {
              data: {
                id: response.id,
                name: response.name,
                email: response.email,
                created_at: response.created_at,
              },
              meta: {
                access_token: token,
              },
            },
          };

          //?Cookie generation
          res
            .cookie("access_token_user", token, {
              httpOnly: true,
              sameSite: "None",
              secure: false,
              maxAge: 24 * 60 * 60 * 1000,
            })
            .json(ans);
        }
      );
    } catch (err) {
      res.status(500).json({ status: false, reason: err });
    }
  }
);

//** Signin endpoint for user */
AuthRouter.post(
  "/signin",
  [
    body("email")
      .exists()
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
    body("password")
      .exists()
      .isLength({ min: 6 })
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      ),
  ],
  async (req, res) => {
    try {
      //? Input Validation
      let errors = validationResult(req);
      if (!errors.isEmpty()) throw errors;

      //?Retriving details from the database
      let user = await userModel.findOne({ email: req.body.email });
      if (!user) throw "Invalid Credentials..";

      //? console.log(user); For debugging purpose

      //?Verifying the password
      let passCompare = await bcrypt.compare(req.body.password, user.password);
      if (!passCompare) throw "Invalid Credentials..Wrong Password";

      // //?Token and cookie generation
      jwt.sign(
        { name: user.name, email: req.body.email, id: user.id },
        process.env.JWT_TOKEN_USER,
        { expiresIn: "60m" },
        (err, token) => {
          if (err)
            throw "Internal Server Error, Please try again after sometime (Token generation issue)";

          //? console.log(token); for debugging purpose

          //? Creating response object
          let ans = {
            status: true,
            content: {
              data: {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at,
              },
              meta: {
                access_token: token,
              },
            },
          };

          //?Cookie generation
          res
            .cookie("access_token_user", token, {
              httpOnly: true,
              sameSite: "None",
              secure: false,
              maxAge: 24 * 60 * 60 * 1000,
            })
            .json(ans);
        }
      );
    } catch (err) {
      res.status(500).json({ status: false, reason: err });
    }
  }
);

//** Route for retriving details for logged in user */
AuthRouter.get("/me", auth.authorizationUser, async (req, res) => {
  try {
    //? Retriving requried details from cookie
    let email = req.email;

    //?Retriving user details
    let data = await userModel.findOne(
      { email: email },
      { _id: 0, __v: 0, password: 0 }
    );

    //? console.log(data); for debugging purpose

    //?Miscelleious error
    if (!data) throw "Error in retreiving details..Internal Server Error";

    //?Creating response obj
    let ans = {
      status: true,
      content: {
        data: data,
      },
    };

    res.json(ans);
  } catch (err) {
    res.status(500).json({ status: false, reason: err });
  }
});

//** Route for logging out */
AuthRouter.get("/logout", auth.authorizationUser, async (req, res) => {
  res
    .clearCookie("access_token_user")
    .json({ status: "User logged out successfully.." });
});

module.exports = AuthRouter;
