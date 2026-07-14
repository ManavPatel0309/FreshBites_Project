const express = require("express");
const router = express.Router();

const {
  addFood,
  getFoods,
  getFoodById,
  updateFood,
  deleteFood,
} = require("../controllers/foodController");

// Get all foods
router.get("/", getFoods);

// Get single food
router.get("/:id", getFoodById);

// Add food
router.post("/", addFood);

// Update food
router.put("/:id", updateFood);

// Delete food
router.delete("/:id", deleteFood);

module.exports = router;