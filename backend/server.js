const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/warehouses", require("./routes/warehouseRoutes"));
app.use("/api/receipts", require("./routes/receiptRoutes"));
app.use("/api/deliveries", require("./routes/deliveryRoutes"));
app.use("/api/transfers", require("./routes/transferRoutes"));
app.use("/api/adjustments", require("./routes/adjustmentRoutes"));
app.use("/api/moves", require("./routes/moveHistoryRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "StockSense API" }));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 StockSense API running on port ${PORT}`));
