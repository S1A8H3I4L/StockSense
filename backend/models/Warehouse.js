const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  shortCode: { type: String, required: true, trim: true, uppercase: true },
});

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shortCode: { type: String, required: true, trim: true, uppercase: true, unique: true },
    address: { type: String, trim: true },
    locations: [locationSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Warehouse", warehouseSchema);
