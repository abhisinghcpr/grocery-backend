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
  description: {
    type: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  image: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Product", productSchema);