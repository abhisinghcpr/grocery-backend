const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middlewares/authMiddleware");

const multer = require("multer");
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

// ================= GET PROFILE =================
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,

        // ✅ SAFE IMAGE (no uploads fallback)
        image_url: user.image
          ? user.image.startsWith("http")
            ? user.image
            : null
          : null
      }
    });

  } catch (err) {
    console.log("PROFILE ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ================= UPDATE PROFILE =================
router.put("/profile", auth, upload.single("image"), async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    // update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // ✅ Cloudinary image update
    if (req.file) {
      user.image = req.file.path; // Cloudinary URL
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image_url: user.image
      }
    });

  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;