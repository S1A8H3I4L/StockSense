# 📦 StockSense — Inventory Management System

A modular, full-stack Inventory Management System (IMS) that replaces manual
registers, Excel sheets and scattered tracking with a centralized, real-time,
easy-to-use app. Built with the **MERN stack** (MongoDB, Express, React,
Node.js) and styled in a clean, Odoo-inspired light theme (`#714B67`).

---

## ✨ Features

- **Authentication** — signup/login (JWT), OTP-based password reset (email or
  console in dev mode), profile management.
- **Dashboard** — live KPIs (total products, low/out-of-stock, pending
  receipts & deliveries, scheduled transfers, inventory value), a 7‑day stock
  movement area chart, a category distribution donut chart, and status
  breakdowns per document type.
- **Products** — create/update products with SKU, category, unit of measure,
  cost & sales price, reorder point, and per-location stock, with smart
  search & status filters (In Stock / Low Stock / Out of Stock).
- **Receipts (Incoming)** — draft → validate flow; validating a receipt
  automatically increases stock and writes an entry to the stock ledger.
- **Delivery Orders (Outgoing)** — automatically flagged `waiting` (insufficient
  stock) or `ready`; validating decreases stock and blocks over-selling.
- **Internal Transfers** — move stock between locations inside a warehouse;
  total stock is unchanged, only location allocation moves.
- **Stock Adjustments** — reconcile counted vs. system quantity in one step;
  the difference is applied instantly and logged.
- **Move History (Stock Ledger)** — single source of truth for every unit
  that ever moved, filterable by document type & reference.
- **Multi-warehouse support** — warehouses with multiple named locations
  (Stock, Production Rack, Dock, etc.).
- **Responsive, animated UI** — light theme, Odoo primary color `#714B67`,
  subtle motion (Framer Motion), fully responsive down to mobile.

---

## 🗂️ Project Structure

```
stocksense/
├── backend/                   # Node.js + Express + MongoDB API
│   ├── config/db.js           # Mongo connection
│   ├── models/                # Mongoose schemas (User, Product, Warehouse,
│   │                          #   Receipt, Delivery, InternalTransfer,
│   │                          #   Adjustment, StockMove, Category)
│   ├── controllers/           # Business logic for every module
│   ├── routes/                # Express routers, mounted under /api/*
│   ├── middleware/            # JWT auth guard + centralized error handler
│   ├── utils/                 # OTP, email, JWT, reference-number generator, seed script
│   ├── server.js              # App entry point
│   └── .env.example           # Copy to .env and fill in your own values
│
├── frontend/                  # React 18 + Vite + Tailwind CSS
│   └── src/
│       ├── api/axios.js       # Pre-configured axios instance (auth header, 401 redirect)
│       ├── context/AuthContext.jsx
│       ├── components/        # Sidebar, Topbar, Layout, Modal, StatCard, Badge...
│       └── pages/
│           ├── auth/          # Login, Signup, Forgot Password (OTP flow)
│           ├── products/
│           ├── operations/    # Receipts, Deliveries, Transfers, Adjustments
│           └── settings/      # Warehouses
│
├── .gitignore
└── README.md
```

---

## 🧱 Tech Stack

| Layer     | Technology                                              |
|-----------|----------------------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, React Router, Recharts, Framer Motion, Axios, react-hot-toast, lucide-react |
| Backend   | Node.js, Express, JWT, bcryptjs, Nodemailer               |
| Database  | MongoDB + Mongoose                                        |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js ≥ 18
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

### 2. Backend Setup

```bash
cd backend
cp .env.example .env      # then edit .env (at minimum set JWT_SECRET)
npm install
npm run seed               # optional: creates a demo user + sample data
npm run dev                 # starts API on http://localhost:5000
```

Demo login after seeding: **admin@stocksense.app / admin123**

> No SMTP configured? OTP codes are simply printed to the backend console —
> the whole password-reset flow still works end-to-end in dev mode.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev                 # starts app on http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so no extra
CORS configuration is needed in development.

### 4. Production Build

```bash
cd frontend && npm run build     # outputs static files to frontend/dist
cd ../backend && npm start        # serve the API (point a static host / Nginx at frontend/dist)
```

---

## 🔑 Environment Variables (backend/.env)

| Variable        | Description                                   |
|-----------------|------------------------------------------------|
| `PORT`          | API port (default 5000)                        |
| `MONGO_URI`     | MongoDB connection string                        |
| `JWT_SECRET`    | Secret used to sign JWTs — change this!          |
| `JWT_EXPIRES_IN`| Token lifetime, e.g. `7d`                        |
| `CLIENT_URL`    | Frontend origin, for CORS                        |
| `SMTP_*`        | Optional — if unset, OTPs are logged to console  |

---

## 📡 API Overview

All routes are prefixed with `/api` and (aside from auth) require a
`Authorization: Bearer <token>` header.

| Module        | Endpoint                          |
|---------------|-------------------------------------|
| Auth          | `POST /auth/signup`, `/login`, `/forgot-password`, `/verify-otp`, `/reset-password`, `PUT /auth/profile` |
| Products      | `GET/POST /products`, `GET/PUT/DELETE /products/:id` |
| Categories    | `GET/POST /categories`, `PUT/DELETE /categories/:id` |
| Warehouses    | `GET/POST /warehouses`, `PUT/DELETE /warehouses/:id`, `POST /warehouses/:id/locations` |
| Receipts      | `GET/POST /receipts`, `.../:id`, `POST .../:id/validate`, `.../:id/cancel` |
| Deliveries    | `GET/POST /deliveries`, `.../:id`, `POST .../:id/validate`, `.../:id/cancel` |
| Transfers     | `GET/POST /transfers`, `.../:id`, `POST .../:id/validate`, `.../:id/cancel` |
| Adjustments   | `GET/POST /adjustments`             |
| Move History  | `GET /moves`                        |
| Dashboard     | `GET /dashboard`                    |

---

## 🎨 Design System

- Primary color: **`#714B67`** (Odoo purple)
- Background: white / `#F7F6F8` canvas
- Rounded 14–18px corners, soft shadows, Inter font
- Status badges: Draft (gray), Waiting (amber), Ready (blue), Done (green),
  Cancelled (red) — mirrors the Draft → Waiting → Ready → Done lifecycle
  from the original wireframes.

---

## 🧭 Inventory Flow (matches the brief 1:1)

1. **Receive** 100 kg Steel → Receipt validated → stock **+100**
2. **Internal Transfer**: Main Store → Production Rack → total stock
   unchanged, location updated
3. **Deliver** 20 units → Delivery validated → stock **−20**
4. **Adjust** 3 kg damaged → Adjustment applied → stock **−3**

Every one of these steps writes an entry to `StockMove` (the Stock Ledger),
visible under **Move History**.

---

## 👨‍💻 Author

**Sahil Panchal**
Full Stack Developer

---

## ⭐ Support

If you like this project, consider giving it a star!

---

**📈 StockSense - Real-time inventory, zero spreadsheets.**
