const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");

// 🔥 CLOUDINARY
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const Product = require("../models/Product");
const Category = require("../models/Category");
const auth = require("../middlewares/authMiddleware");

// ================= CLOUDINARY STORAGE =================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "grocery/products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
});

const upload = multer({ storage });


// ================= ADD PRODUCT =================
router.post("/add", auth, upload.single("image"), async (req, res) => {
  try {

    // 🔥 👉 यहीं add करना है (सबसे ऊपर)
    if (!req.file) {
      return res.json({
        success: false,
        message: "Image required"
      });
    }

    const {
      name,
      price,
      discountPrice,
      stock,
      category,
      description,
      quantity,
      unit
    } = req.body;

    if (!name || !price || !category) {
      return res.json({
        success: false,
        message: "All fields required"
      });
    }

    const checkCategory = await Category.findById(category);
    if (!checkCategory) {
      return res.json({
        success: false,
        message: "Invalid category"
      });
    }

    const product = await Product.create({
      name,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stock: stock ? Number(stock) : 0,
      description,
      quantity: quantity ? Number(quantity) : 0,
      unit: unit || "g",
      category,

      // 🔥 image यहाँ आएगा
      image: req.file.path
    });

    res.json({
      success: true,
      product: {
        ...product._doc,
        size: `${product.quantity}${product.unit}`,
        image_url: product.image
      }
    });

  } catch (err) {
    console.log("ADD ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= GET ALL =================
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    let products;

    if (category) {
      products = await Product.find({ category }).populate("category", "name");
    } else {
      products = await Product.find().populate("category", "name");
    }

    const data = products.map(p => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      discountPrice: p.discountPrice,
      stock: p.stock,
      description: p.description,
      quantity: p.quantity || 0,
      unit: p.unit || "",
      size: `${p.quantity}${p.unit}`,
      category: p.category?.name,
     image_url: p.image
  ? p.image.startsWith("http")
    ? p.image
    : null
  : null
    }));

    res.json({
      success: true,
      products: data
    });

  } catch (err) {
    console.log("GET ALL ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= DETAILS (FIXED 🔥) =================
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    console.log("DETAIL ID:", id);

    // ✅ invalid id check
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const product = await Product.findById(id)
      .populate("category", "name");

    console.log("FOUND PRODUCT:", product);

    if (!product) {
      return res.json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        description: product.description,
        quantity: product.quantity,
        unit: product.unit,
        size: `${product.quantity}${product.unit}`,
        category: product.category?.name,
        image_url: product.image
  ? product.image.startsWith("http")
    ? product.image
    : null
  : null
      }
    });

  } catch (err) {
    console.log("DETAIL ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ================= UPDATE =================
router.put("/update/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.json({ success: false });
    }

    const {
      name,
      price,
      discountPrice,
      stock,
      category,
      description,
      quantity,
      unit
    } = req.body;

    if (name) product.name = name;
    if (price) product.price = Number(price);
    if (discountPrice) product.discountPrice = Number(discountPrice);
    if (stock) product.stock = Number(stock);
    if (description) product.description = description;
    if (quantity) product.quantity = Number(quantity);
    if (unit) product.unit = unit;
    if (category) product.category = category;

    if (req.file) {
      product.image = req.file.path;
    }

    await product.save();

    res.json({
      success: true,
      product: {
        ...product._doc,
        size: `${product.quantity}${product.unit}`,
        image_url: product.image
      }
    });

  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= DELETE =================
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Deleted"
    });
    
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;