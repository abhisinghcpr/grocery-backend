const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  discountPrice: {
    type: Number
  },

  stock: {
    type: Number,
    default: 0
  },

  description: String,

  // 🔥 NEW
  quantity: Number, // 400, 1
  unit: {
    type: String,
    enum: ["g", "kg", "ml", "L"]
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },

  image: String

}, {
  timestamps: true
});

module.exports = mongoose.model("Product", productSchema);