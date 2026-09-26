const mongoose = require("mongoose");

/**
 * StockMove is the single source of truth ledger for every unit that
 * ever moved in the system - receipts, deliveries, transfers & adjustments
 * all write an entry here (mirrors the "Stock Ledger" concept from the brief).
 */
const stockMoveSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true },
    docType: {
      type: String,
      enum: ["receipt", "delivery", "internal_transfer", "adjustment"],
      required: true,
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true }, // positive = in, negative = out
    from: { type: String, default: "" },
    to: { type: String, default: "" },
    contact: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "waiting", "ready", "done", "cancelled"],
      default: "done",
    },
    date: { type: Date, default: Date.now },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockMove", stockMoveSchema);
