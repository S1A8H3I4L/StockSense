const mongoose = require("mongoose");

const lineSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const internalTransferSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    fromLocation: { type: String, required: true },
    toLocation: { type: String, required: true },
    scheduleDate: { type: Date, default: Date.now },
    responsible: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    products: [lineSchema],
    status: {
      type: String,
      enum: ["draft", "ready", "done", "cancelled"],
      default: "draft",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("InternalTransfer", internalTransferSchema);
