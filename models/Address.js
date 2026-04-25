const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  title: String, // Home / Work

  name: String,
  phone: String,
  email: String,

  address: String,
  city: String,
  state: String,
  pincode: String,

  isSelected: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Address", addressSchema);