const express = require("express");
const router = express.Router();
const multer = require("multer");
const Product = require("../models/Product");
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

const baseUrl = process.env.BASE_URL || "http://localhost:3000";


// ================= ADD PRODUCT =================
router.post("/add", auth, upload.single("image"), async (req, res) => {
  try {
    const { name, price, discountPrice, stock, category, description } = req.body;

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
      stock: Number(stock),
      description,
      category,
      image: req.file ? req.file.filename : null
    });

    res.json({
      success: true,
      message: "Product added",
      product: {
        ...product._doc,
       image_url: product.image
  ? `${cleanBaseUrl}/uploads/${product.image}`
  : null
      }
    });

  } catch (err) {
    console.log("PRODUCT ADD ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= GET ALL PRODUCTS =================
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
      category: p.category?.name,
      image_url: p.image
        ? `${baseUrl}/uploads/${p.image}`
        : null
    }));

    res.json({
      success: true,
      products: data
    });

  } catch (err) {
    console.log("PRODUCT GET ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= PRODUCT DETAILS =================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name");

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
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
        category: product.category?.name,
        image_url: product.image
  ? `${cleanBaseUrl}/uploads/${product.image}`
  : null,
        createdAt: product.createdAt
      }
    });

  } catch (err) {
    console.log("PRODUCT DETAILS ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= UPDATE PRODUCT =================
router.put("/update/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const { name, price, discountPrice, stock, category, description } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    if (category) {
      const checkCategory = await Category.findById(category);
      if (!checkCategory) {
        return res.json({ success: false, message: "Invalid category" });
      }
      product.category = category;
    }

    if (name) product.name = name;
    if (price) product.price = Number(price);
    if (discountPrice) product.discountPrice = Number(discountPrice);
    if (stock) product.stock = Number(stock);
    if (description) product.description = description;

    if (req.file) {
      product.image = req.file.filename;
    }

    await product.save();

    res.json({
      success: true,
      message: "Product updated",
      product: {
        ...product._doc,
       image_url: product.image
  ? `${cleanBaseUrl}/uploads/${product.image}`
  : null
      }
    });

  } catch (err) {
    console.log("PRODUCT UPDATE ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= DELETE PRODUCT =================
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Product deleted"
    });

  } catch (err) {
    console.log("PRODUCT DELETE ERROR:", err);
    res.status(500).json({ success: false });
  }
});
const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const cleanBaseUrl = baseUrl.replace(/\/$/, "");
module.exports = router;