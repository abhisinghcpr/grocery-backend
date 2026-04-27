const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middlewares/authMiddleware");

const multer = require("multer");

// 🔥 ADD THIS
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");


// ================= CLOUDINARY STORAGE =================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "grocery/profile",
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
});

const upload = multer({ storage });


// ================= PROFILE VIEW =================
router.get("/profile", auth, async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,

        // 🔥 CHANGE HERE
        image_url: user.image || null
      }
    });

  } catch (err) {
    console.log("PROFILE ERROR FULL:", err);
    res.status(500).json({ success: false });
  }
});


// ================= PROFILE UPDATE =================
router.put("/profile", auth, upload.single("image"), async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    // 🔥 CHANGE HERE
    if (req.file) {
      user.image = req.file.path; // cloudinary URL
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated",

      // 🔥 CHANGE HERE
      image_url: user.image
    });

  } catch (err) {
    console.log("UPDATE ERROR FULL:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;