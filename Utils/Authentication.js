const jwt = require("jsonwebtoken");

//* For authorizing user cookie
function authorizationUser(req, res, next) {
  const token = req.cookies.access_token_user;
  if (!token) {
    res.status(401).json({ status: "Cannot access without logging in.." });
  } else {
    try {
      const data = jwt.verify(token, process.env.JWT_TOKEN_USER);
      req.email = data.email;
      return next();
    } catch {
      res.status(500).json("Internal Server Error.. (Token expired)");
    }
  }
}

module.exports = { authorizationUser };
