const express = require("express");
const router = express.Router();

const crypto = require("crypto");

const razorpay = require("../utils/razorpay");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Address = require("../models/Address");
const auth = require("../middlewares/authMiddleware");


// ================= CREATE PAYMENT =================
router.post("/create-payment", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.json({ success: false, message: "Cart empty" });
    }

    let total = 0;

    cart.items.forEach(item => {
      // 🔥 SAFE CHECK
      if (!item.product) return;

      const price = item.product.discountPrice || item.product.price;
      total += price * item.quantity;
    });

    const deliveryFee = total > 200 ? 0 : 20;
    const finalAmount = total + deliveryFee;

    const order = await razorpay.orders.create({
      amount: finalAmount * 100,
      currency: "INR",
      receipt: "order_" + Date.now()
    });

    res.json({
      success: true,
      order,
      amount: finalAmount
    });

  } catch (err) {
    console.log("CREATE PAYMENT ERROR:", err.message);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


// ================= VERIFY PAYMENT =================
router.post("/verify-payment", auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      addressId
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.json({
        success: false,
        message: "Payment failed"
      });
    }

    // ✅ Payment success → order save

    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    const address = await Address.findById(addressId);

    let total = 0;

    const items = cart.items.map(item => {
      const price = item.product.discountPrice || item.product.price;
      total += price * item.quantity;

      return {
        product: item.product._id,
        quantity: item.quantity,
        price
      };
    });

    const deliveryFee = total > 200 ? 0 : 20;
    const finalTotal = total + deliveryFee;

    const order = await Order.create({
      user: req.user.id,
      items,
      address,
      paymentMethod: "ONLINE",
      paymentStatus: "Paid",
      totalAmount: finalTotal
    });

    await Cart.findOneAndDelete({ user: req.user.id });

    res.json({
      success: true,
      message: "Order placed",
      orderId: order._id
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= COD ORDER =================
router.post("/place-cod", auth, async (req, res) => {
  try {
    const { addressId } = req.body;

    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    const address = await Address.findById(addressId);

    let total = 0;

    const items = cart.items.map(item => {
      const price = item.product.discountPrice || item.product.price;
      total += price * item.quantity;

      return {
        product: item.product._id,
        quantity: item.quantity,
        price
      };
    });

    const deliveryFee = total > 200 ? 0 : 20;
    const finalTotal = total + deliveryFee;

    const order = await Order.create({
      user: req.user.id,
      items,
      address,
      paymentMethod: "COD",
      paymentStatus: "Pending",
      totalAmount: finalTotal
    });

    await Cart.findOneAndDelete({ user: req.user.id });

    res.json({
      success: true,
      message: "Order placed",
      orderId: order._id
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= MY ORDERS =================
router.get("/my-orders", auth, async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    orders
  });
});
// ================= MY ORDERS (ONGOING + COMPLETED) =================
router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product") // 🔥 MOST IMPORTANT̥
      .sort({ createdAt: -1 });

const data = orders.map(order => {
  const firstItem = order.items[0]

  let image = null;

  if (firstItem && firstItem.product && typeof firstItem.product === "object") {
    image = firstItem.product.image || null;
  }

  return {
    _id: order._id,
    orderId: "ORD-" + order._id.toString().slice(-6),
    items: order.items.length,
    amount: order.totalAmount,
    status: order.orderStatus,
    createdAt: order.createdAt,
    image: image
  };
});

    res.json({
      success: true,
      orders: data
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});
// ================= UPDATE ORDER STATUS =================
router.put("/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );

    res.json({
      success: true,
      order
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});
module.exports = router;