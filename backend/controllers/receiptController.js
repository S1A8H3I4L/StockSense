const Receipt = require("../models/Receipt");
const Product = require("../models/Product");
const StockMove = require("../models/StockMove");
const Warehouse = require("../models/Warehouse");
const generateReference = require("../utils/generateReference");

const getReceipts = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: "i" } },
        { supplier: { $regex: search, $options: "i" } },
      ];
    }
    const receipts = await Receipt.find(query)
      .populate("warehouse", "name shortCode")
      .populate("products.product", "name sku")
      .sort({ createdAt: -1 });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate("warehouse", "name shortCode")
      .populate("products.product", "name sku onHand");
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReceipt = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.body.warehouse);
    if (!warehouse) return res.status(400).json({ message: "Invalid warehouse" });

    const reference = await generateReference(Receipt, warehouse.shortCode, "IN");

    const receipt = await Receipt.create({
      ...req.body,
      reference,
      responsible: req.user._id,
      status: "draft",
    });

    res.status(201).json(receipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Validate receipt -> increases stock, writes to ledger
const validateReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id).populate("warehouse");
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });
    if (receipt.status === "done") return res.status(400).json({ message: "Receipt already validated" });

    for (const line of receipt.products) {
      const product = await Product.findById(line.product);
      if (!product) continue;
      product.onHand += line.quantity;

      const locEntry = product.stockByLocation.find(
        (s) => String(s.warehouse) === String(receipt.warehouse._id) && s.locationCode === receipt.destinationLocation
      );
      if (locEntry) locEntry.quantity += line.quantity;
      else
        product.stockByLocation.push({
          warehouse: receipt.warehouse._id,
          locationCode: receipt.destinationLocation,
          quantity: line.quantity,
        });

      await product.save();

      await StockMove.create({
        reference: receipt.reference,
        docType: "receipt",
        product: product._id,
        quantity: line.quantity,
        from: receipt.supplier,
        to: `${receipt.warehouse.shortCode}/${receipt.destinationLocation}`,
        contact: receipt.supplier,
        status: "done",
        performedBy: req.user._id,
      });
    }

    receipt.status = "done";
    await receipt.save();

    res.json({ message: "Receipt validated. Stock updated.", receipt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });
    if (receipt.status === "done") {
      return res.status(400).json({ message: "Cannot delete a validated receipt" });
    }
    await receipt.deleteOne();
    res.json({ message: "Receipt deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReceipts,
  getReceipt,
  createReceipt,
  updateReceipt,
  validateReceipt,
  cancelReceipt,
  deleteReceipt,
};
