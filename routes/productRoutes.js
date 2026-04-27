const express = require("express");
const router = express.Router();
const multer = require("multer");

// 🔥 ADD THIS
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const Product = require("../models/Product");
const Category = require("../models/Category");
const auth = require("../middlewares/authMiddleware");

// ================= CHANGE MULTER =================
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
      return res.json({ success: false, message: "All fields required" });
    }

    const checkCategory = await Category.findById(category);
    if (!checkCategory) {
      return res.json({ success: false, message: "Invalid category" });
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

      // 🔥 CHANGE HERE
      image: req.file ? req.file.path : null
    });

    res.json({
      success: true,
      product: {
        ...product._doc,
        size: `${product.quantity}${product.unit}`,

        // 🔥 CHANGE HERE
        image_url: product.image
      }
    });

  } catch (err) {
    console.log(err);
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

      // 🔥 CHANGE HERE
      image_url: p.image
    }));

    res.json({
      success: true,
      products: data
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= DETAILS =================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name");

    if (!product) {
      return res.json({ success: false });
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

        // 🔥 CHANGE HERE
        image_url: product.image
      }
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= UPDATE =================
router.put("/update/:id", auth, upload.single("image"), async (req, res) => {
  try {
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

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.json({ success: false });
    }

    if (name) product.name = name;
    if (price) product.price = Number(price);
    if (discountPrice) product.discountPrice = Number(discountPrice);
    if (stock) product.stock = Number(stock);
    if (description) product.description = description;
    if (quantity) product.quantity = Number(quantity);
    if (unit) product.unit = unit;
    if (category) product.category = category;

    // 🔥 CHANGE HERE
    if (req.file) {
      product.image = req.file.path;
    }

    await product.save();

    res.json({
      success: true,
      product: {
        ...product._doc,
        size: `${product.quantity}${product.unit}`,

        // 🔥 CHANGE HERE
        image_url: product.image
      }
    });

  } catch (err) {
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