const mongoose = require("mongoose");

const stockByLocationSchema = new mongoose.Schema(
  {
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
    locationCode: { type: String },
    quantity: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, unique: true, uppercase: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    unitOfMeasure: { type: String, default: "Units" },
    costPerUnit: { type: Number, default: 0 },
    salesPrice: { type: Number, default: 0 },
    reorderPoint: { type: Number, default: 10 },
    reorderQty: { type: Number, default: 50 },
    onHand: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    stockByLocation: [stockByLocationSchema],
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.virtual("freeToUse").get(function () {
  return this.onHand - this.reserved;
});

productSchema.virtual("stockStatus").get(function () {
  if (this.onHand <= 0) return "out_of_stock";
  if (this.onHand <= this.reorderPoint) return "low_stock";
  return "in_stock";
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
