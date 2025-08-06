// models/Category.js
const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Shop by Bike", "Compose"
  slug: { type: String, required: true, unique: true }, // URL-friendly
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null }, // null if top-level
  type: { type: String, enum: ["main", "brand", "model", "part", "subpart"], default: "main" }
}, { timestamps: true });


module.exports = mongoose.model("Category",categorySchema)