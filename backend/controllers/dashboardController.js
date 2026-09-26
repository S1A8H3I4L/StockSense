const Product = require("../models/Product");
const Receipt = require("../models/Receipt");
const Delivery = require("../models/Delivery");
const InternalTransfer = require("../models/InternalTransfer");
const StockMove = require("../models/StockMove");

const getDashboardStats = async (req, res) => {
  try {
    const products = await Product.find();

    const totalProducts = products.length;
    const totalStockUnits = products.reduce((sum, p) => sum + p.onHand, 0);
    const lowStock = products.filter((p) => p.stockStatus === "low_stock").length;
    const outOfStock = products.filter((p) => p.stockStatus === "out_of_stock").length;

    const pendingReceipts = await Receipt.countDocuments({ status: { $in: ["draft", "ready"] } });
    const pendingDeliveries = await Delivery.countDocuments({ status: { $in: ["draft", "waiting", "ready"] } });
    const scheduledTransfers = await InternalTransfer.countDocuments({ status: { $in: ["draft", "ready"] } });

    // Inventory value
    const inventoryValue = products.reduce((sum, p) => sum + p.onHand * p.costPerUnit, 0);

   // Stock movement trend - last 7 days (including today)
// Stock movement trend - 09-24-2026 to 09-30-2026
const startDate = new Date(2026, 8, 24, 0, 0, 0, 0);
const endDate = new Date(2026, 8, 30, 23, 59, 59, 999);

const recentMoves = await StockMove.find({
  date: {
    $gte: startDate,
    $lte: endDate,
  },
});

const formatDate = (date) => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const trendMap = {};

for (let i = 0; i < 7; i++) {
  const d = new Date(startDate);
  d.setDate(startDate.getDate() + i);

  const key = formatDate(d);

  trendMap[key] = {
    date: key,
    in: 0,
    out: 0,
  };
}

recentMoves.forEach((m) => {
  const moveDate = new Date(m.date);

  const key = formatDate(moveDate);

  if (!trendMap[key]) return;

// Internal transfers do not change total stock
if (m.docType === "internal_transfer") return;

const quantity = Number(m.quantity) || 0;

  if (quantity > 0) {
    trendMap[key].in += quantity;
  } else if (quantity < 0) {
    trendMap[key].out += Math.abs(quantity);
  }
});
const movementTrend = Object.values(trendMap);

    // Category distribution
    const populated = await Product.find().populate("category", "name");
    const categoryMap = {};
    populated.forEach((p) => {
      const name = p.category?.name || "Uncategorized";
      categoryMap[name] = (categoryMap[name] || 0) + p.onHand;
    });
    const categoryDistribution = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Document status breakdown (for dynamic filters/kanban counts)
    const statusBreakdown = {
      receipts: await aggregateStatus(Receipt),
      deliveries: await aggregateStatus(Delivery),
      transfers: await aggregateStatus(InternalTransfer),
    };

    res.json({
      kpis: {
        totalProducts,
        totalStockUnits,
        lowStock,
        outOfStock,
        pendingReceipts,
        pendingDeliveries,
        scheduledTransfers,
        inventoryValue,
      },
      movementTrend,
      categoryDistribution,
      statusBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function aggregateStatus(Model) {
  const results = await Model.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  const map = { draft: 0, waiting: 0, ready: 0, done: 0, cancelled: 0 };
  results.forEach((r) => {
    if (map[r._id] !== undefined) map[r._id] = r.count;
  });
  return map;
}

module.exports = { getDashboardStats };
