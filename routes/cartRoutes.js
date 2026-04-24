const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middlewares/authMiddleware");

const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const cleanBaseUrl = baseUrl.replace(/\/$/, "");


// ================= ADD TO CART =================
router.post("/add", auth, async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const index = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (index > -1) {
      cart.items[index].quantity += 1;
    } else {
      cart.items.push({ product: productId, quantity: 1 });
    }

    await cart.save();

    res.json({ success: true, message: "Added to cart" });

  } catch (err) {
    console.log("CART ADD ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= REMOVE FROM CART =================
router.post("/remove", auth, async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.json({ success: false, message: "Cart empty" });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();

    res.json({ success: true, message: "Removed from cart" });

  } catch (err) {
    console.log("CART REMOVE ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= UPDATE QUANTITY =================
router.post("/update", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.find(
      i => i.product.toString() === productId
    );

    if (!item) {
      return res.json({ success: false, message: "Item not found" });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        i => i.product.toString() !== productId
      );
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();

    res.json({ success: true, message: "Cart updated" });

  } catch (err) {
    console.log("CART UPDATE ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// ================= VIEW CART =================
router.get("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.json({
        success: true,
        cart: [],
        grandTotal: 0
      });
    }

    let grandTotal = 0;

    const data = cart.items.map(item => {
      const p = item.product;

      const price = p.discountPrice || p.price;
      const total = price * item.quantity;

      grandTotal += total;

      return {
        productId: p._id,
        name: p.name,
        price: p.price,
        discountPrice: p.discountPrice,
        quantity: item.quantity,
        total,
        image_url: p.image
          ? `${cleanBaseUrl}/uploads/${p.image}`
          : null
      };
    });

    res.json({
      success: true,
      cart: data,
      grandTotal
    });

  } catch (err) {
    console.log("CART GET ERROR:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;