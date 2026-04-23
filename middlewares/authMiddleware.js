const jwt = require("jsonwebtoken");

const SECRET_KEY = "mysecretkey";

module.exports = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.json({ success: false, message: "No token" });
  }

  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.json({ success: false, message: "Invalid token" });
  }
};