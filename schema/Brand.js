// models/Category.js
const mongoose = require('mongoose')

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Shop by Bike", "Compose"
   
}, { timestamps: true });


module.exports = mongoose.model("brands",BrandSchema)