const Delivery = require("../models/Delivery");
const Product = require("../models/Product");
const StockMove = require("../models/StockMove");
const Warehouse = require("../models/Warehouse");
const generateReference = require("../utils/generateReference");

const getDeliveries = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: "i" } },
        { customer: { $regex: search, $options: "i" } },
      ];
    }
    const deliveries = await Delivery.find(query)
      .populate("warehouse", "name shortCode")
      .populate("products.product", "name sku onHand")
      .sort({ createdAt: -1 });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate("warehouse", "name shortCode")
      .populate("products.product", "name sku onHand");
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDelivery = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.body.warehouse);
    if (!warehouse) return res.status(400).json({ message: "Invalid warehouse" });

    const reference = await generateReference(Delivery, warehouse.shortCode, "OUT");

    // Check stock availability and set status accordingly
    let allInStock = true;
    for (const line of req.body.products || []) {
      const product = await Product.findById(line.product);
      if (!product || product.onHand - product.reserved < line.quantity) {
        allInStock = false;
      }
    }

    const delivery = await Delivery.create({
      ...req.body,
      reference,
      responsible: req.user._id,
      status: allInStock ? "ready" : "waiting",
    });

    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Validate delivery -> decreases stock, writes to ledger
const validateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id).populate("warehouse");
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    if (delivery.status === "done") return res.status(400).json({ message: "Delivery already validated" });

    for (const line of delivery.products) {
      const product = await Product.findById(line.product);
      if (!product) continue;

      if (product.onHand < line.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.onHand}, required: ${line.quantity}`,
        });
      }

      product.onHand -= line.quantity;

      const locEntry = product.stockByLocation.find(
        (s) => String(s.warehouse) === String(delivery.warehouse._id) && s.locationCode === delivery.sourceLocation
      );
      if (locEntry) locEntry.quantity = Math.max(0, locEntry.quantity - line.quantity);

      await product.save();

      await StockMove.create({
        reference: delivery.reference,
        docType: "delivery",
        product: product._id,
        quantity: -line.quantity,
        from: `${delivery.warehouse.shortCode}/${delivery.sourceLocation}`,
        to: delivery.customer,
        contact: delivery.customer,
        status: "done",
  date: delivery.scheduleDate,
        performedBy: req.user._id,
      });
    }

    delivery.status = "done";
    await delivery.save();

    res.json({ message: "Delivery validated. Stock updated.", delivery });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    if (delivery.status === "done") {
      return res.status(400).json({ message: "Cannot delete a validated delivery" });
    }
    await delivery.deleteOne();
    res.json({ message: "Delivery deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDeliveries,
  getDelivery,
  createDelivery,
  updateDelivery,
  validateDelivery,
  cancelDelivery,
  deleteDelivery,
};
