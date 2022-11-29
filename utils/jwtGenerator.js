const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(UserId) {
  const payload = {
    user: UserId,
  };
  return jwt.sign(payload, process.env.mySecret, { expiresIn: "1hr" });
}

module.exports = jwtGenerator;
