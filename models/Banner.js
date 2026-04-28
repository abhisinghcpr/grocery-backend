const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: String,
  subtitle: String,

  image: {
    type: String // cloudinary URL
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Banner", bannerSchema);