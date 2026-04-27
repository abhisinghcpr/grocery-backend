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
  }

}, {
  versionKey: false
});

module.exports = mongoose.model("User", userSchema);