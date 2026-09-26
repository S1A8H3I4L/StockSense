/**
 * Run with: npm run seed
 * Seeds a demo user, categories, warehouse & products so the app is
 * usable immediately after setup.
 */
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Warehouse = require("../models/Warehouse");
const Product = require("../models/Product");

dotenv.config();

const run = async () => {
  await connectDB();

  console.log("🌱 Seeding demo data...");

  const existingUser = await User.findOne({ email: "admin@stocksense.app" });
  if (!existingUser) {
    await User.create({
      name: "Admin User",
      email: "admin@stocksense.app",
      password: "admin123",
      role: "admin",
    });
    console.log("👤 Demo user created: admin@stocksense.app / admin123");
  }

  const categories = ["Electronics", "Furniture", "Raw Materials", "Packaging"];
  const categoryDocs = {};
  for (const name of categories) {
    let cat = await Category.findOne({ name });
    if (!cat) cat = await Category.create({ name });
    categoryDocs[name] = cat;
  }

  let warehouse = await Warehouse.findOne({ shortCode: "WH" });
  if (!warehouse) {
    warehouse = await Warehouse.create({
      name: "Main Warehouse",
      shortCode: "WH",
      address: "Sydney, Australia",
      locations: [
        { name: "Stock", shortCode: "Stock" },
        { name: "Production Rack", shortCode: "ProdRack" },
        { name: "Receiving Dock", shortCode: "Dock" },
      ],
    });
    console.log("🏬 Demo warehouse created: Main Warehouse (WH)");
  }

  const demoProducts = [
    { name: "Steel Rods", sku: "STL-001", category: "Raw Materials", onHand: 240, costPerUnit: 120, reorderPoint: 50 },
    { name: "Office Desk", sku: "DESK-001", category: "Furniture", onHand: 45, costPerUnit: 3000, reorderPoint: 20 },
    { name: "Office Chair", sku: "CHR-001", category: "Furniture", onHand: 8, costPerUnit: 2200, reorderPoint: 15 },
    { name: "Wireless Mouse", sku: "MSE-001", category: "Electronics", onHand: 120, costPerUnit: 450, reorderPoint: 30 },
    { name: "Cardboard Box (M)", sku: "BOX-M-001", category: "Packaging", onHand: 0, costPerUnit: 15, reorderPoint: 100 },
  ];

  for (const p of demoProducts) {
    const exists = await Product.findOne({ sku: p.sku });
    if (!exists) {
      await Product.create({
        name: p.name,
        sku: p.sku,
        category: categoryDocs[p.category]._id,
        onHand: p.onHand,
        costPerUnit: p.costPerUnit,
        reorderPoint: p.reorderPoint,
        unitOfMeasure: "Units",
        stockByLocation: [{ warehouse: warehouse._id, locationCode: "Stock", quantity: p.onHand }],
      });
    }
  }
  console.log("📦 Demo products created");

  console.log("✅ Seed complete!");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
