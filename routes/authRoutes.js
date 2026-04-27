const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || "customer" // default
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      SECRET_KEY,
      { expiresIn: "7d" }
    );

    const userData = user.toObject();
    delete userData.password;

    res.json({ success: true, token, user: userData });

  } catch (err) {
    res.json({ success: false, message: "User already exists" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.json({ success: false, message: "Wrong password" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    SECRET_KEY,
    { expiresIn: "7d" }
  );

  const userData = user.toObject();
  delete userData.password;

  res.json({ success: true, token, user: userData });
});

module.exports = router;