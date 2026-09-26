const mongoose = require("mongoose");

const lineSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const deliverySchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    customer: { type: String, required: true, trim: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    sourceLocation: { type: String, default: "Stock" },
    deliveryAddress: { type: String, default: "" },
    scheduleDate: { type: Date, default: Date.now },
    responsible: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    products: [lineSchema],
    status: {
      type: String,
      enum: ["draft", "waiting", "ready", "done", "cancelled"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Delivery", deliverySchema);
