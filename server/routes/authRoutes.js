const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  register,
  login,
  getProfile,
  updateProfile,
  addWalletMoney,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/wallet/add", authMiddleware, addWalletMoney);

module.exports = router;