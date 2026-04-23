const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middlewares/authMiddleware");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// PROFILE VIEW
router.get("/profile", auth, async (req, res) => {
  const user = await User.findOne({ email: req.user.email });

  res.json({
    success: true,
    user: {
      ...user._doc,
    image_url: user.image
  ? `${process.env.BASE_URL}/uploads/${user.image}`
  : null
    }
  });
});

// UPDATE
router.put("/profile", auth, upload.single("image"), async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findOne({ email: req.user.email });

  if (req.file) {
    user.image = req.file.filename;
  }

  user.name = name;
  user.phone = phone;

  await user.save();

  res.json({
    success: true,
    message: "Profile updated",
    image_url: image
  ? `${process.env.BASE_URL}/uploads/${image}`
  : null
  });
});

module.exports = router;