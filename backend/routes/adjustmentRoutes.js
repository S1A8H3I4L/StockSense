const express = require("express");
const router = express.Router();
const { getAdjustments, createAdjustment } = require("../controllers/adjustmentController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.route("/").get(getAdjustments).post(createAdjustment);

module.exports = router;
