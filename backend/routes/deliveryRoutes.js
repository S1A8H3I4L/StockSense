const express = require("express");
const router = express.Router();
const {
  getDeliveries,
  getDelivery,
  createDelivery,
  updateDelivery,
  validateDelivery,
  cancelDelivery,
  deleteDelivery,
} = require("../controllers/deliveryController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.route("/").get(getDeliveries).post(createDelivery);
router.route("/:id").get(getDelivery).put(updateDelivery).delete(deleteDelivery);
router.post("/:id/validate", validateDelivery);
router.post("/:id/cancel", cancelDelivery);

module.exports = router;
