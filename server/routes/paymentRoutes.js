const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createOrder,
  verifyPayment,
  getPaymentStatus,
} = require("../controllers/paymentController");

/* =========================
   CREATE RAZORPAY ORDER
========================= */
router.post("/create-order", authMiddleware, createOrder);

/* =========================
   VERIFY PAYMENT FROM FRONTEND
========================= */
router.post("/verify", authMiddleware, verifyPayment);

/* =========================
   CHECK PAYMENT STATUS
========================= */
router.get("/status/:id", authMiddleware, getPaymentStatus);

module.exports = router;