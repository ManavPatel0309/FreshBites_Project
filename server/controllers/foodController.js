const db = require("../config/db");

/* =========================
   ADD FOOD
========================= */
exports.addFood = async (req, res) => {
  try {
    const { name, price, category, image, description } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Food name and price are required",
      });
    }

    await db.query(
      `INSERT INTO foods 
       (name, price, category, image, description)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name,
        Number(price),
        category || "",
        image || "",
        description || "",
      ]
    );

    res.status(201).json({
      success: true,
      message: "Food added successfully",
    });
  } catch (error) {
    console.log("Add Food Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================
   GET ALL FOODS
========================= */
exports.getFoods = async (req, res) => {
  try {
    const [foods] = await db.query(
      "SELECT * FROM foods ORDER BY id DESC"
    );

    res.status(200).json({
      success: true,
      foods,
    });
  } catch (error) {
    console.log("Get Foods Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================
   GET SINGLE FOOD
========================= */
exports.getFoodById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM foods WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    res.status(200).json({
      success: true,
      food: rows[0],
    });
  } catch (error) {
    console.log("Get Food By Id Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================
   UPDATE FOOD
========================= */
exports.updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, image, description } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Food name and price are required",
      });
    }

    const [result] = await db.query(
      `UPDATE foods
       SET name = ?,
           price = ?,
           category = ?,
           image = ?,
           description = ?
       WHERE id = ?`,
      [
        name,
        Number(price),
        category || "",
        image || "",
        description || "",
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Food updated successfully",
    });
  } catch (error) {
    console.log("Update Food Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================
   DELETE FOOD
========================= */
exports.deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM foods WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Food deleted successfully",
    });
  } catch (error) {
    console.log("Delete Food Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};