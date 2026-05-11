const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));

// ❌ REMOVE THIS (IMPORTANT)
// app.use("/uploads", express.static("uploads"));

app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/address", require("./routes/addressRoutes"));
app.use("/api/order", require("./routes/orderRoutes"));
app.use("/api/banner", require("./routes/bannerRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/seller", require("./routes/sellerRoutes"));

app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});