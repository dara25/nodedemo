const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    const jwtToken = req.header("token");
    if (!jwtToken) return res.status(403).json("Not Authorized");

    const payload = jwt.verify(jwtToken, process.env.mySecret);
    req.user = payload.user;
    // verify() will return payload ប្រសិនបើ the given token is valid
  } catch (err) {
    console.error(err.message);
    return res.status(403).json("Not Authorized");
  }
  next();
};
