const Warehouse = require("../models/Warehouse");

const getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find().sort({ name: 1 });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createWarehouse = async (req, res) => {
  try {
    const exists = await Warehouse.findOne({ shortCode: req.body.shortCode?.toUpperCase() });
    if (exists) return res.status(400).json({ message: "Warehouse short code already exists" });
    const warehouse = await Warehouse.create(req.body);
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });
    res.json({ message: "Warehouse deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addLocation = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });
    warehouse.locations.push(req.body);
    await warehouse.save();
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, addLocation };
