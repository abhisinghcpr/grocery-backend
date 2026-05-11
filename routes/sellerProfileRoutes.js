const express = require("express");

const router = express.Router();

const auth = require("../middlewares/authMiddleware");

const User = require("../models/User");

const multer = require("multer");

const { CloudinaryStorage } =
require("multer-storage-cloudinary");

const cloudinary =
require("../utils/cloudinary");


/// ================= CLOUDINARY =================

const storage = new CloudinaryStorage({

  cloudinary: cloudinary,

  params: {
    folder: "grocery/seller-profile",

    allowed_formats: [
      "jpg",
      "png",
      "jpeg",
      "webp"
    ]
  }
});

const upload = multer({ storage });


/// ================= GET PROFILE =================

router.get("/profile", auth, async (req, res) => {

  try {

    if (req.user.role !== "seller") {

      return res.json({
        success: false,
        message: "Only seller allowed"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {

      return res.json({
        success: false,
        message: "User not found"
      });
    }

    res.json({

      success: true,

      seller: {

        _id: user._id,

        storeName: user.storeName,

        storeAddress: user.storeAddress,

        email: user.email,

        phone: user.phone,

        image: user.image,

        role: user.role
      }
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false
    });
  }
});


/// ================= UPDATE PROFILE =================

router.put(
  "/profile",
  auth,
  upload.single("image"),

  async (req, res) => {

    try {

      if (req.user.role !== "seller") {

        return res.json({
          success: false,
          message: "Only seller allowed"
        });
      }

      const {
        storeName,
        storeAddress,
        phone
      } = req.body;

      const user =
      await User.findById(req.user.id);

      if (!user) {

        return res.json({
          success: false,
          message: "User not found"
        });
      }

      // 🔥 UPDATE
      if (storeName) {
        user.storeName = storeName;
      }

      if (storeAddress) {
        user.storeAddress = storeAddress;
      }

      if (phone) {
        user.phone = phone;
      }

      // 🔥 IMAGE
      if (req.file) {
        user.image = req.file.path;
      }

      await user.save();

      res.json({

        success: true,

        message: "Profile updated",

        seller: {

          _id: user._id,

          storeName: user.storeName,

          storeAddress: user.storeAddress,

          email: user.email,

          phone: user.phone,

          image: user.image
        }
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false
      });
    }
  }
);

module.exports = router;