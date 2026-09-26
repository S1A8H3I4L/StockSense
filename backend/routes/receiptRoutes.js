const express = require("express");
const router = express.Router();
const {
  getReceipts,
  getReceipt,
  createReceipt,
  updateReceipt,
  validateReceipt,
  cancelReceipt,
  deleteReceipt,
} = require("../controllers/receiptController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.route("/").get(getReceipts).post(createReceipt);
router.route("/:id").get(getReceipt).put(updateReceipt).delete(deleteReceipt);
router.post("/:id/validate", validateReceipt);
router.post("/:id/cancel", cancelReceipt);

module.exports = router;
