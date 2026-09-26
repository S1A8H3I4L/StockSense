const mongoose = require("mongoose");

const adjustmentSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    location: { type: String, default: "Stock" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    countedQuantity: { type: Number, required: true },
    systemQuantity: { type: Number, required: true },
    difference: { type: Number, required: true },
    reason: { type: String, default: "" },
    responsible: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["draft", "done"], default: "done" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Adjustment", adjustmentSchema);
