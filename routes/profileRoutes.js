const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middlewares/authMiddleware");
const multer = require("multer");

// multer config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// base URL (important for live + local)
const baseUrl = process.env.BASE_URL || "http://localhost:3000";


// ================== PROFILE VIEW ==================
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        ...user._doc,
        image_url: user.image
          ? `${baseUrl}/uploads/${user.image}`
          : null
      }
    });

  } catch (err) {
    console.log("PROFILE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ================== PROFILE UPDATE ==================
router.put("/profile", auth, upload.single("image"), async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // update image
    if (req.file) {
      user.image = req.file.filename;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated",
      image_url: user.image
        ? `${baseUrl}/uploads/${user.image}`
        : null
    });

  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;