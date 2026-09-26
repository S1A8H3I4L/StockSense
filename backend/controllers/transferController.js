const InternalTransfer = require("../models/InternalTransfer");
const Product = require("../models/Product");
const StockMove = require("../models/StockMove");
const Warehouse = require("../models/Warehouse");
const generateReference = require("../utils/generateReference");

const getTransfers = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.reference = { $regex: search, $options: "i" };
    const transfers = await InternalTransfer.find(query)
      .populate("warehouse", "name shortCode")
      .populate("products.product", "name sku onHand")
      .sort({ createdAt: -1 });
    res.json(transfers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTransfer = async (req, res) => {
  try {
    const transfer = await InternalTransfer.findById(req.params.id)
      .populate("warehouse", "name shortCode")
      .populate("products.product", "name sku onHand");
    if (!transfer) return res.status(404).json({ message: "Transfer not found" });
    res.json(transfer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTransfer = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.body.warehouse);
    if (!warehouse) return res.status(400).json({ message: "Invalid warehouse" });

    const reference = await generateReference(InternalTransfer, warehouse.shortCode, "INT");

    const transfer = await InternalTransfer.create({
      ...req.body,
      reference,
      responsible: req.user._id,
      status: "draft",
    });

    res.status(201).json(transfer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTransfer = async (req, res) => {
  try {
    const transfer = await InternalTransfer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!transfer) return res.status(404).json({ message: "Transfer not found" });
    res.json(transfer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Validate transfer -> moves quantity between locations, total stock unchanged
const validateTransfer = async (req, res) => {
  try {
    const transfer = await InternalTransfer.findById(req.params.id).populate("warehouse");
    if (!transfer) return res.status(404).json({ message: "Transfer not found" });
    if (transfer.status === "done") return res.status(400).json({ message: "Transfer already validated" });

    for (const line of transfer.products) {
      const product = await Product.findById(line.product);
      if (!product) continue;

      const fromEntry = product.stockByLocation.find(
        (s) => String(s.warehouse) === String(transfer.warehouse._id) && s.locationCode === transfer.fromLocation
      );
      if (fromEntry) fromEntry.quantity = Math.max(0, fromEntry.quantity - line.quantity);

      const toEntry = product.stockByLocation.find(
        (s) => String(s.warehouse) === String(transfer.warehouse._id) && s.locationCode === transfer.toLocation
      );
      if (toEntry) toEntry.quantity += line.quantity;
      else
        product.stockByLocation.push({
          warehouse: transfer.warehouse._id,
          locationCode: transfer.toLocation,
          quantity: line.quantity,
        });

      await product.save();

      await StockMove.create({
        reference: transfer.reference,
        docType: "internal_transfer",
        product: product._id,
        quantity: line.quantity,
        from: `${transfer.warehouse.shortCode}/${transfer.fromLocation}`,
        to: `${transfer.warehouse.shortCode}/${transfer.toLocation}`,
        contact: "Internal",
        status: "done",
date: receipt.date,
        performedBy: req.user._id,
      });
    }

    transfer.status = "done";
    await transfer.save();

    res.json({ message: "Transfer validated. Location updated.", transfer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelTransfer = async (req, res) => {
  try {
    const transfer = await InternalTransfer.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
    if (!transfer) return res.status(404).json({ message: "Transfer not found" });
    res.json(transfer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTransfer = async (req, res) => {
  try {
    const transfer = await InternalTransfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ message: "Transfer not found" });
    if (transfer.status === "done") return res.status(400).json({ message: "Cannot delete a validated transfer" });
    await transfer.deleteOne();
    res.json({ message: "Transfer deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTransfers,
  getTransfer,
  createTransfer,
  updateTransfer,
  validateTransfer,
  cancelTransfer,
  deleteTransfer,
};
