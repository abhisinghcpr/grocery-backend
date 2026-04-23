const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));

// image folder
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});