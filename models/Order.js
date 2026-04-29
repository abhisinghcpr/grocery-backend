const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],

  address: {
    type: Object,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ["COD", "ONLINE"],
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending"
  },

  orderStatus: {
    type: String,
    enum: ["Placed", "Processing", "Out for Delivery", "Delivered"],
    default: "Placed"
  },

  totalAmount: {
    type: Number,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);