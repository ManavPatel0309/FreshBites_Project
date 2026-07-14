const express = require("express");
const router = express.Router();

const adminMiddleware = require("../middleware/adminMiddleware");

const {
  adminLogin,

  getDashboard,

  getUsers,
  deleteUser,

  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,

  getFoods,
  addFood,
  updateFood,
  deleteFood,

  getWallets,
  updateWallet,
  getWalletTransactions,

  getRiders,
  addRider,
  updateRider,
  deleteRider,
  assignRider,

  getAnalytics,
} = require("../controllers/adminController");

/* =========================
   ADMIN LOGIN - PUBLIC
========================= */
router.post("/login", adminLogin);

/* =========================
   PROTECTED ADMIN ROUTES
========================= */
router.use(adminMiddleware);

/* =========================
   DASHBOARD
========================= */
router.get("/dashboard", getDashboard);

/* =========================
   USERS
========================= */
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);

/* =========================
   ORDERS
========================= */
router.get("/orders", getOrders);
router.get("/orders/:id", getOrderById);
router.put("/orders/:id/status", updateOrderStatus);
router.delete("/orders/:id", deleteOrder);

/* =========================
   FOODS
========================= */
router.get("/foods", getFoods);
router.post("/foods", addFood);
router.put("/foods/:id", updateFood);
router.delete("/foods/:id", deleteFood);

/* =========================
   WALLETS
========================= */
router.get("/wallets", getWallets);
router.put("/wallet/:userId", updateWallet);
router.get("/wallet-transactions", getWalletTransactions);

/* =========================
   RIDERS
========================= */
router.get("/riders", getRiders);
router.post("/riders", addRider);
router.put("/riders/:id", updateRider);
router.delete("/riders/:id", deleteRider);
router.post("/riders/assign", assignRider);

/* =========================
   ANALYTICS
========================= */
router.get("/analytics", getAnalytics);

module.exports = router;