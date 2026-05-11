const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;


// ================= SIGNUP =================
// ================= SIGNUP =================
router.post("/signup", async (req, res) => {
  try {

    const {
      name,
      email,
      phone,
      password,
      role,
      storeName,
      storeAddress
    } = req.body;

    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "Required fields missing"
      });
    }

    // 🔥 Seller validation
    if (role === "seller") {

      if (!storeName || !storeAddress) {
        return res.json({
          success: false,
          message: "Store name and address required"
        });
      }
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || "customer",

      // 🔥 only seller
      storeName: role === "seller" ? storeName : null,
      storeAddress: role === "seller" ? storeAddress : null
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      SECRET_KEY,
      {
        expiresIn: "7d"
      }
    );

    const userData = user.toObject();

    delete userData.password;

    res.json({
      success: true,
      token,
      user: userData
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false
    });
  }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // 🔥 ROLE CHECK (simple)
    if (role && user.role !== role) {
      return res.json({
        success: false,
        message: `Login as ${user.role}`
      });
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

    res.json({
      success: true,
      token,
      user: userData
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;