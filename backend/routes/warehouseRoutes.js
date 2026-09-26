const express = require("express");
const router = express.Router();
const {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  addLocation,
} = require("../controllers/warehouseController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.route("/").get(getWarehouses).post(createWarehouse);
router.route("/:id").put(updateWarehouse).delete(deleteWarehouse);
router.post("/:id/locations", addLocation);

module.exports = router;
