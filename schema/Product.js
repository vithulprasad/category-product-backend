const mongoose= require("mongoose");

const Product = mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Clear", "Tinted"
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true },
  images: { type: String },
 category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }], 
  stock: { type: Number, default: 0 },
  brand:{ type: mongoose.Schema.Types.ObjectId, ref: "Brand"},
})

module.exports = mongoose.model("products",Product)