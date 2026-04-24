const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middlewares/authMiddleware");

const baseUrl = process.env.BASE_URL || "http://localhost:3000";


// ================= ADD TO CART =================
router.post("/add", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    let cartItem = await Cart.findOne({
      user: req.user.id,
      product: productId
    });

    if (cartItem) {
      cartItem.quantity += quantity ? Number(quantity) : 1;
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        user: req.user.id,
        product: productId,
        quantity: quantity ? Number(quantity) : 1
      });
    }

    res.json({ success: true, message: "Added to cart" });

  } catch (err) {
    console.log("CART ADD ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= VIEW CART =================
router.get("/", auth, async (req, res) => {
  try {
    const cart = await Cart.find({ user: req.user.id })
      .populate("product");

    let grandTotal = 0;

    const data = cart.map(item => {
      const price = item.product.discountPrice || item.product.price;
      const total = price * item.quantity;

      grandTotal += total;

      return {
        _id: item._id,
        productId: item.product._id,
        name: item.product.name,
        price: item.product.price,
        discountPrice: item.product.discountPrice,
        quantity: item.quantity,
        total,
        image_url: item.product.image
          ? `${baseUrl}/uploads/${item.product.image}`
          : null
      };
    });

    res.json({
      success: true,
      cart: data,
      grandTotal // 🔥 important
    });

  } catch (err) {
    console.log("CART GET ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= UPDATE QUANTITY =================
router.put("/update/:id", auth, async (req, res) => {
  try {
    const { quantity } = req.body;

    const cartItem = await Cart.findById(req.params.id);

    if (!cartItem) {
      return res.json({ success: false, message: "Item not found" });
    }

    // 🔐 user check
    if (cartItem.user.toString() !== req.user.id) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    if (quantity <= 0) {
      await Cart.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: "Item removed" });
    }

    cartItem.quantity = Number(quantity);
    await cartItem.save();

    res.json({
      success: true,
      message: "Cart updated"
    });

  } catch (err) {
    console.log("CART UPDATE ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= REMOVE ITEM =================
router.delete("/remove/:id", auth, async (req, res) => {
  try {
    const cartItem = await Cart.findById(req.params.id);

    if (!cartItem) {
      return res.json({ success: false, message: "Item not found" });
    }

    // 🔐 user check
    if (cartItem.user.toString() !== req.user.id) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    await Cart.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Item removed"
    });

  } catch (err) {
    console.log("CART DELETE ERROR:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;