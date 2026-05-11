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


// ================= SELLER ALL ORDERS =================
router.get("/orders", auth, async (req, res) => {

  try {

    // 🔥 seller only
    if (req.user.role !== "seller") {
      return res.json({
        success: false,
        message: "Only seller allowed"
      });
    }

    const {
      status,
      search
    } = req.query;

    let query = {};

    // ================= STATUS FILTER =================
    if (status && status !== "All") {
      query.orderStatus = status;
    }

    let orders = await Order.find(query)
      .populate("user", "name")
      .populate("items.product")
      .sort({ createdAt: -1 });

    // ================= SEARCH =================
    if (search) {

      orders = orders.filter(order => {

        const customerName =
          order.user?.name?.toLowerCase() || "";

        const orderId =
          order._id.toString().toLowerCase();

        return (
          customerName.includes(search.toLowerCase()) ||
          orderId.includes(search.toLowerCase())
        );
      });
    }

    const data = orders.map(order => {

      return {

        _id: order._id,

        orderId:
          "#ORD-" +
          order._id.toString().slice(-4),

        customerName:
          order.user?.name || "",

        status:
          order.orderStatus,

        totalAmount:
          order.totalAmount,

        createdAt:
          order.createdAt,

        address:
          order.address?.address || "",

        items: order.items.map(item => ({

          productId:
            item.product?._id,

          name:
            item.product?.name || "",

          quantity:
            item.quantity,

          size:
            `${item.product?.quantity || 0}${item.product?.unit || ""}`

        }))
      };
    });

    res.json({
      success: true,
      orders: data
    });

  } catch (err) {

    console.log("SELLER ORDER ERROR:", err);

    res.status(500).json({
      success: false
    });
  }
});


// ================= UPDATE STATUS =================
router.put("/orders/status/:id", auth, async (req, res) => {

  try {

    if (req.user.role !== "seller") {
      return res.json({
        success: false,
        message: "Only seller allowed"
      });
    }

    const { status } = req.body;

    const allowed = [
      "Placed",
      "Processing",
      "Out for Delivery",
      "Delivered"
    ];

    if (!allowed.includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status"
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus: status
      },
      {
        new: true
      }
    );

    res.json({
      success: true,
      message: "Status updated",
      order
    });

  } catch (err) {

    console.log("STATUS UPDATE ERROR:", err);

    res.status(500).json({
      success: false
    });
  }
});


module.exports = router;