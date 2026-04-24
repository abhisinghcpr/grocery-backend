const express = require("express");
const router = express.Router();
const multer = require("multer");
const Category = require("../models/Category");
const auth = require("../middlewares/authMiddleware");

// multer config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// base URL (for image show)
const baseUrl = process.env.BASE_URL || "http://localhost:3000";


// ================= ADD CATEGORY (Seller / Logged user) =================
router.post("/add", auth, upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.json({ success: false, message: "Name required" });
    }

    const category = await Category.create({
      name,
      image: req.file ? req.file.filename : null
    });

    res.json({
      success: true,
      message: "Category added successfully",
      category: {
        ...category._doc,
        image_url: category.image
          ? `${baseUrl}/uploads/${category.image}`
          : null
      }
    });

  } catch (err) {
    console.log("CATEGORY ADD ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ================= GET ALL CATEGORY (Customer + Seller) =================
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    const data = categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      image_url: cat.image
        ? `${baseUrl}/uploads/${cat.image}`
        : null
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
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.json({
        success: false,
        message: "Category not found"
      });
    }

    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (err) {
    console.log("CATEGORY DELETE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});
module.exports = router;