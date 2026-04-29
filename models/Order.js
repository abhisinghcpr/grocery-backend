const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: Number,
      price: Number
    }
  ],

  address: Object,

  paymentMethod: {
    type: String,
    enum: ["COD", "ONLINE"]
  },

  paymentStatus: {
    type: String,
    default: "Pending"
  },

  orderStatus: {
    type: String,
    default: "Placed"
  },

  totalAmount: Number

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);