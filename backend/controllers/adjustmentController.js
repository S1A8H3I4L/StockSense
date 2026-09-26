const Adjustment = require("../models/Adjustment");
const Product = require("../models/Product");
const StockMove = require("../models/StockMove");
const Warehouse = require("../models/Warehouse");
const generateReference = require("../utils/generateReference");

const getAdjustments = async (req, res) => {
  try {
    const adjustments = await Adjustment.find()
      .populate("warehouse", "name shortCode")
      .populate("product", "name sku")
      .sort({ createdAt: -1 });
    res.json(adjustments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create + immediately apply a stock adjustment (counted vs system quantity)
const createAdjustment = async (req, res) => {
  try {
    const { warehouse: warehouseId, location, product: productId, countedQuantity, reason } = req.body;

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) return res.status(400).json({ message: "Invalid warehouse" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const systemQuantity = product.onHand;
    const difference = Number(countedQuantity) - systemQuantity;

    const reference = await generateReference(Adjustment, warehouse.shortCode, "ADJ");

    const adjustment = await Adjustment.create({
      reference,
      warehouse: warehouseId,
      location: location || "Stock",
      product: productId,
      countedQuantity,
      systemQuantity,
      difference,
      reason,
      responsible: req.user._id,
      status: "done",
    });

    product.onHand = Number(countedQuantity);
    const locEntry = product.stockByLocation.find(
      (s) => String(s.warehouse) === String(warehouseId) && s.locationCode === (location || "Stock")
    );
    if (locEntry) locEntry.quantity = Number(countedQuantity);
    else
      product.stockByLocation.push({
        warehouse: warehouseId,
        locationCode: location || "Stock",
        quantity: Number(countedQuantity),
      });
    await product.save();

    await StockMove.create({
  reference,
  docType: "adjustment",
  product: product._id,
  quantity: difference,
  from: "Inventory Adjustment",
  to: `${warehouse.shortCode}/${location || "Stock"}`,
  contact: "System",
  status: "done",
  date: adjustment.createdAt,
  performedBy: req.user._id,
  note: reason,
});

    res.status(201).json(adjustment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdjustments, createAdjustment };
