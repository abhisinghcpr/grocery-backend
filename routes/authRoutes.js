const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "mysecretkey";

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
    [name, email, phone, hashedPassword],
    (err) => {
      if (err) {
        return res.json({ success: false, message: "User already exists" });
      }

      const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "7d" });

      res.json({
        success: true,
        token,
        user: { name, email, phone }
      });
    }
  );
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (result.length === 0) {
        return res.json({ success: false, message: "User not found" });
      }

      const user = result[0];

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.json({ success: false, message: "Wrong password" });
      }

      const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "7d" });

      res.json({
        success: true,
        token,
        user
      });
    }
  );
});

module.exports = router;