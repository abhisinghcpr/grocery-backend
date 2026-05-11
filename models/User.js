const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    unique: true
  },

  phone: String,

  password: String,

  image: String,

  role: {
    type: String,
    enum: ["customer", "seller"],
    default: "customer"
  },

  // 🔥 SELLER ONLY
  storeName: {
    type: String,
    default: null
  },

  storeAddress: {
    type: String,
    default: null
  }

}, {
  versionKey: false
});

module.exports = mongoose.model("User", userSchema);