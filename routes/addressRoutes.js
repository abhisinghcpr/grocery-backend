const express = require("express");
const router = express.Router();
const Address = require("../models/Address");
const auth = require("../middlewares/authMiddleware");

// ================= ADD ADDRESS =================
router.post("/add", auth, async (req, res) => {
  try {
    const {
      title,
      name,
      phone,
      email,
      address,
      city,
      state,
      pincode
    } = req.body;

    if (!name || !phone || !address) {
      return res.json({
        success: false,
        message: "Name, phone and address required"
      });
    }

    const data = await Address.create({
      user: req.user.id,
      title,
      name,
      phone,
      email,
      address,
      city,
      state,
      pincode
    });

    res.json({
      success: true,
      message: "Address added",
      address: data
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});


// ================= GET ALL =================
router.get("/", auth, async (req, res) => {
  const list = await Address.find({ user: req.user.id });

  res.json({
    success: true,
    addresses: list
  });
});


// ================= SELECT =================
router.post("/select/:id", auth, async (req, res) => {
  await Address.updateMany(
    { user: req.user.id },
    { isSelected: false }
  );

  await Address.findByIdAndUpdate(req.params.id, {
    isSelected: true
  });

  res.json({
    success: true,
    message: "Address selected"
  });
});


// ================= DELETE =================
router.delete("/delete/:id", auth, async (req, res) => {
  await Address.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Deleted"
  });
});
// test change
console.log("ADDRESS ROUTE LOADED");
module.exports = router;