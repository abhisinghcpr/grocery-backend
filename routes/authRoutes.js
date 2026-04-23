const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword
    });

    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "7d" });

    res.json({ success: true, token, user });
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

  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "7d" });

  res.json({ success: true, token, user });
});

module.exports = router;