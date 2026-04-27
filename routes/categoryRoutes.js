const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");
const Category = require("../models/Category");
const auth = require("../middlewares/authMiddleware");

// ================= CLOUDINARY STORAGE =================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "grocery/categories",
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
});

const upload = multer({ storage });


// ================= ADD CATEGORY =================
router.post("/add", auth, upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.json({ success: false, message: "Name required" });
    }

    const category = await Category.create({
      name,
      image: req.file ? req.file.path : null // 🔥 Cloudinary URL
    });

    res.json({
      success: true,
      message: "Category added successfully",
      category: {
        _id: category._id,
        name: category.name,
        image_url: category.image
      }
    });

  } catch (err) {
    console.log("CATEGORY ADD ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= GET ALL =================
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    const data = categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      image_url: cat.image // 🔥 direct cloudinary URL
    }));

    res.json({
      success: true,
      categories: data
    });

  } catch (err) {
    console.log("CATEGORY FETCH ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= DELETE CATEGORY =================
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.json({
        success: false,
        message: "Category not found"
      });
    }

    // 🔥 Cloudinary image delete (optional but best)
    if (category.image) {
      const parts = category.image.split("/");
      const publicId = parts
        .slice(-2)
        .join("/")
        .split(".")[0];

      await cloudinary.uploader.destroy(publicId);
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (err) {
    console.log("CATEGORY DELETE ERROR:", err);
    res.status(500).json({
      success: false
    });
  }
});

module.exports = router;