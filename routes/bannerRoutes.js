const express = require("express");
const router = express.Router();

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const Banner = require("../models/Banner");

// ================= CLOUDINARY =================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "grocery/banners",
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
});

const upload = multer({ storage });


// ================= ADD BANNER =================
router.post("/add", upload.single("image"), async (req, res) => {
  try {

    if (!req.file) {
      return res.json({
        success: false,
        message: "Image required"
      });
    }

    const { title, subtitle, category } = req.body;

    const banner = await Banner.create({
      title,
      subtitle,
      category,
      image: req.file.path // ✔ Cloudinary URL
    });

    res.json({
      success: true,
      banner: {
        _id: banner._id,
        title: banner.title,
        subtitle: banner.subtitle,
        image_url: banner.image,
        category: banner.category
      }
    });

  } catch (err) {
    console.log("BANNER ADD ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= GET ALL =================
router.get("/", async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true });

    const data = banners.map(b => ({
      _id: b._id,
      title: b.title,
      subtitle: b.subtitle,
      image_url: b.image,
      category: b.category
    }));

    res.json({
      success: true,
      banners: data
    });

  } catch (err) {
    console.log("BANNER GET ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= DELETE =================
router.delete("/delete/:id", async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.json({ success: false });
    }

    // 🔥 Cloudinary delete
    if (banner.image) {
      const parts = banner.image.split("/");
      const publicId = parts.slice(-2).join("/").split(".")[0];

      await cloudinary.uploader.destroy(publicId);
    }

    await Banner.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Deleted"
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;