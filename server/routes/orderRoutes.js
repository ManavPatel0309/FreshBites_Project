const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  placeOrder,
  getMyOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

router.post("/", authMiddleware, placeOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.put("/:id/status", authMiddleware, updateOrderStatus);

module.exports = router;