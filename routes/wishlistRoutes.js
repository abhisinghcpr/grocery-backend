const express = require("express");
const router = express.Router();

const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const auth = require("../middlewares/authMiddleware");


// ================= ADD / TOGGLE =================
router.post("/add", auth, async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        products: []
      });
    }

    const exists = wishlist.products.includes(productId);

    if (exists) {
      // 🔥 REMOVE
      wishlist.products = wishlist.products.filter(
        p => p.toString() !== productId
      );

      await wishlist.save();

      return res.json({
        success: true,
        message: "Removed from wishlist"
      });

    } else {
      // 🔥 ADD
      wishlist.products.push(productId);
      await wishlist.save();

      return res.json({
        success: true,
        message: "Added to wishlist"
      });
    }

  } catch (err) {
    console.log("WISHLIST ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= VIEW =================
router.get("/", auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate("products");

    if (!wishlist || wishlist.products.length === 0) {
      return res.json({
        success: true,
        wishlist: []
      });
    }

    const data = wishlist.products.map(p => ({
      productId: p._id,
      name: p.name,
      price: p.price,
      discountPrice: p.discountPrice,
      image: p.image
    }));

    res.json({
      success: true,
      wishlist: data
    });

  } catch (err) {
    console.log("WISHLIST VIEW ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= REMOVE =================
router.post("/remove", auth, async (req, res) => {
  try {
    const { productId } = req.body;

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.json({ success: false, message: "Wishlist empty" });
    }

    wishlist.products = wishlist.products.filter(
      p => p.toString() !== productId
    );

    await wishlist.save();

    res.json({
      success: true,
      message: "Removed from wishlist"
    });

  } catch (err) {
    console.log("WISHLIST REMOVE ERROR:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;