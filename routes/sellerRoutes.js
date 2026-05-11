const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");

const Order = require("../models/Order");
const Product = require("../models/Product");


// ================= SELLER DASHBOARD =================
router.get("/dashboard", auth, async (req, res) => {

  try {

    // 🔥 seller check
    if (req.user.role !== "seller") {
      return res.json({
        success: false,
        message: "Only seller allowed"
      });
    }

    // ================= TOTAL ORDERS =================
    const totalOrders = await Order.countDocuments();

    // ================= PENDING ORDERS =================
    const pendingOrders = await Order.countDocuments({
      orderStatus: {
        $ne: "Delivered"
      }
    });

    // ================= TOTAL PRODUCTS =================
    const totalProducts = await Product.countDocuments();

    // ================= TOTAL REVENUE =================
    const deliveredOrders = await Order.find({
      paymentStatus: {
        $in: ["Paid", "Pending"]
      }
    });

    let totalRevenue = 0;

    deliveredOrders.forEach(order => {
      totalRevenue += order.totalAmount;
    });

    // ================= WEEKLY SALES =================
    const weeklySales = [
      { day: "M", amount: 1200 },
      { day: "T", amount: 1800 },
      { day: "W", amount: 1500 },
      { day: "T", amount: 2200 },
      { day: "F", amount: 2800 },
      { day: "S", amount: 3500 },
      { day: "S", amount: 3000 }
    ];

    res.json({
      success: true,

      dashboard: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        totalProducts,
        weeklySales
      }
    });

  } catch (err) {

    console.log("SELLER DASHBOARD ERROR:", err);

    res.status(500).json({
      success: false
    });
  }
});

module.exports = router;