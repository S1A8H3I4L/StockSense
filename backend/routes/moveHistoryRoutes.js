const express = require("express");
const router = express.Router();
const { getMoveHistory } = require("../controllers/moveHistoryController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getMoveHistory);

module.exports = router;
