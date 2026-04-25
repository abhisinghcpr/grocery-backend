const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Address = require("../models/Address");
const auth = require("../middlewares/authMiddleware");

// PLACE ORDER
router.post("/place", auth, async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const addressData = await Address.findOne({
      user: req.user.id,
      isSelected: true
    });

    if (!addressData) {
      return res.json({ success: false, message: "Select address first" });
    }

    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.json({ success: false, message: "Cart empty" });
    }

    let totalAmount = 0;

    const items = cart.items.map(item => {
      const p = item.product;
      const price = p.discountPrice || p.price;

      totalAmount += price * item.quantity;

      return {
        product: p._id,
        quantity: item.quantity,
        price
      };
    });

    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount,
      address: addressData.address,
      paymentMethod
    });

    // cart clear
    await Cart.findOneAndDelete({ user: req.user.id });

    res.json({
      success: true,
      orderId: order._id,
      totalAmount
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});


// GET MY ORDERS
router.get("/", auth, async (req, res) => {
  const orders = await Order.find({ user: req.user.id });

  res.json({ success: true, orders });
});


// ORDER DETAILS
router.get("/:id", auth, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("items.product");

  res.json({ success: true, order });
});

module.exports = router;