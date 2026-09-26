const express = require("express");
const router = express.Router();
const {
  getTransfers,
  getTransfer,
  createTransfer,
  updateTransfer,
  validateTransfer,
  cancelTransfer,
  deleteTransfer,
} = require("../controllers/transferController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.route("/").get(getTransfers).post(createTransfer);
router.route("/:id").get(getTransfer).put(updateTransfer).delete(deleteTransfer);
router.post("/:id/validate", validateTransfer);
router.post("/:id/cancel", cancelTransfer);

module.exports = router;
