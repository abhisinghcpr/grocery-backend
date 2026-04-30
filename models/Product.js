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

  quantity: {
    type: Number,
    default: 0
  },

  unit: {
    type: String,
    enum: ["g", "kg", "ml", "L"],
    default: "g"
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  
  image: String

}, {
  timestamps: true
});

productSchema.index({ name: "text", description: "text" });


module.exports = mongoose.model("Product", productSchema);