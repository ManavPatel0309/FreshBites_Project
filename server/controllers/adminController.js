const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const runQuery = async (sql, params = []) => {
  const [rows] = await db.query(sql, params);
  return rows;
};

/* =========================
   ADMIN LOGIN
========================= */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admins = await runQuery("SELECT * FROM admins WHERE email = ?", [
      email,
    ]);

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    const admin = admins[0];

    let isMatch = false;

    if (admin.password && admin.password.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, admin.password);
    } else {
      isMatch = password === admin.password;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "admin",
      },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.log("Admin Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Admin login failed",
      error: error.message,
    });
  }
};

/* =========================
   DASHBOARD
========================= */
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await runQuery("SELECT COUNT(*) AS total FROM users");
    const totalOrders = await runQuery("SELECT COUNT(*) AS total FROM orders");
    const totalFoods = await runQuery("SELECT COUNT(*) AS total FROM foods");
    const totalRiders = await runQuery("SELECT COUNT(*) AS total FROM riders");

    const totalRevenue = await runQuery(`
      SELECT COALESCE(SUM(total), 0) AS total
      FROM orders
      WHERE status != 'Cancelled ❌'
    `);

    const activeOrders = await runQuery(`
      SELECT COUNT(*) AS total
      FROM orders
      WHERE is_active = 1
      AND status NOT IN ('Delivered ✅', 'Cancelled ❌')
    `);

    const deliveredOrders = await runQuery(`
      SELECT COUNT(*) AS total
      FROM orders
      WHERE status = 'Delivered ✅'
    `);

    const cancelledOrders = await runQuery(`
      SELECT COUNT(*) AS total
      FROM orders
      WHERE status = 'Cancelled ❌'
    `);

    const recentOrders = await runQuery(`
      SELECT 
        o.*,
        u.name AS user_name,
        u.email AS registered_email,
        r.name AS rider_name,
        r.phone AS rider_phone,
        r.vehicle AS rider_vehicle
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN riders r ON o.rider_id = r.id
      ORDER BY o.id DESC
      LIMIT 5
    `);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers: Number(totalUsers[0].total || 0),
        totalOrders: Number(totalOrders[0].total || 0),
        totalFoods: Number(totalFoods[0].total || 0),
        totalRiders: Number(totalRiders[0].total || 0),
        totalRevenue: Number(totalRevenue[0].total || 0),
        activeOrders: Number(activeOrders[0].total || 0),
        deliveredOrders: Number(deliveredOrders[0].total || 0),
        cancelledOrders: Number(cancelledOrders[0].total || 0),
      },
      recentOrders,
    });
  } catch (error) {
    console.log("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Dashboard fetch failed",
      error: error.message,
    });
  }
};

/* =========================
   USERS
========================= */
exports.getUsers = async (req, res) => {
  try {
    const users = await runQuery(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.dob,
        u.address,
        u.alt_phone,
        u.age,
        u.profile_photo,
        u.wallet_balance,
        u.created_at,
        COUNT(o.id) AS totalOrders,
        COALESCE(SUM(CASE WHEN o.status != 'Cancelled ❌' THEN o.total ELSE 0 END), 0) AS totalSpent
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      GROUP BY
        u.id,
        u.name,
        u.email,
        u.phone,
        u.dob,
        u.address,
        u.alt_phone,
        u.age,
        u.profile_photo,
        u.wallet_balance,
        u.created_at
      ORDER BY u.id DESC
    `);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log("Users Error:", error);

    res.status(500).json({
      success: false,
      message: "Users fetch failed",
      error: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const orders = await runQuery("SELECT id FROM orders WHERE user_id = ?", [
      id,
    ]);

    for (const order of orders) {
      await runQuery("DELETE FROM order_items WHERE order_id = ?", [order.id]);
    }

    await runQuery("DELETE FROM orders WHERE user_id = ?", [id]);
    await runQuery("DELETE FROM wallet_transactions WHERE user_id = ?", [id]);
    await runQuery("DELETE FROM users WHERE id = ?", [id]);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log("Delete User Error:", error);

    res.status(500).json({
      success: false,
      message: "User delete failed",
      error: error.message,
    });
  }
};

/* =========================
   ORDERS
========================= */
exports.getOrders = async (req, res) => {
  try {
    const orders = await runQuery(`
      SELECT 
        o.*,
        u.name AS user_name,
        u.email AS registered_email,
        r.name AS rider_name,
        r.phone AS rider_phone,
        r.vehicle AS rider_vehicle
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN riders r ON o.rider_id = r.id
      ORDER BY o.id DESC
    `);

    const orderItems = await runQuery("SELECT * FROM order_items");

    const finalOrders = orders.map((order) => {
      const items = orderItems.filter(
        (item) => Number(item.order_id) === Number(order.id)
      );

      return {
        ...order,
        orderId: order.id,
        customerName: order.customer_name || order.user_name || "Customer",
        riderName: order.rider_name || "",
        riderPhone: order.rider_phone || "",
        riderVehicle: order.rider_vehicle || "",
        items,
        cartItems: items,
      };
    });

    res.status(200).json({
      success: true,
      orders: finalOrders,
    });
  } catch (error) {
    console.log("Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Orders fetch failed",
      error: error.message,
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const orders = await runQuery(
      `
      SELECT 
        o.*,
        u.name AS user_name,
        u.email AS registered_email,
        r.name AS rider_name,
        r.phone AS rider_phone,
        r.vehicle AS rider_vehicle
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN riders r ON o.rider_id = r.id
      WHERE o.id = ?
      `,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const items = await runQuery("SELECT * FROM order_items WHERE order_id = ?", [
      id,
    ]);

    res.status(200).json({
      success: true,
      order: {
        ...orders[0],
        orderId: orders[0].id,
        customerName: orders[0].customer_name || orders[0].user_name || "Customer",
        riderName: orders[0].rider_name || "",
        riderPhone: orders[0].rider_phone || "",
        riderVehicle: orders[0].rider_vehicle || "",
        items,
        cartItems: items,
      },
    });
  } catch (error) {
    console.log("Get Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Order fetch failed",
      error: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const isActive =
      status !== "Delivered ✅" && status !== "Cancelled ❌" ? 1 : 0;

    const deliveredAt = status === "Delivered ✅" ? new Date() : null;
    const cancelledAt = status === "Cancelled ❌" ? new Date() : null;

    await runQuery(
      `
      UPDATE orders
      SET status = ?,
          is_active = ?,
          delivered_at = ?,
          cancelled_at = ?
      WHERE id = ?
      `,
      [status, isActive, deliveredAt, cancelledAt, id]
    );

    if (status === "Delivered ✅" || status === "Cancelled ❌") {
      await runQuery(
        `
        UPDATE riders
        SET status = 'Available',
            assigned_order_id = NULL
        WHERE assigned_order_id = ?
        `,
        [id]
      );
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.log("Update Order Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Order status update failed",
      error: error.message,
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    await runQuery(
      `
      UPDATE riders
      SET status = 'Available',
          assigned_order_id = NULL
      WHERE assigned_order_id = ?
      `,
      [id]
    );

    await runQuery("DELETE FROM order_items WHERE order_id = ?", [id]);
    await runQuery("DELETE FROM orders WHERE id = ?", [id]);

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.log("Delete Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Order delete failed",
      error: error.message,
    });
  }
};

/* =========================
   FOODS
========================= */
exports.getFoods = async (req, res) => {
  try {
    const foods = await runQuery("SELECT * FROM foods ORDER BY id DESC");

    res.status(200).json({
      success: true,
      foods,
    });
  } catch (error) {
    console.log("Foods Error:", error);

    res.status(500).json({
      success: false,
      message: "Foods fetch failed",
      error: error.message,
    });
  }
};

exports.addFood = async (req, res) => {
  try {
    const { name, price, category, image, description } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Food name and price are required",
      });
    }

    await runQuery(
      `
      INSERT INTO foods 
      (name, price, category, image, description)
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, Number(price), category || "", image || "", description || ""]
    );

    res.status(201).json({
      success: true,
      message: "Food added successfully",
    });
  } catch (error) {
    console.log("Add Food Error:", error);

    res.status(500).json({
      success: false,
      message: "Food add failed",
      error: error.message,
    });
  }
};

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

    await runQuery(
      `
      UPDATE foods 
      SET name = ?,
          price = ?,
          category = ?,
          image = ?,
          description = ?
      WHERE id = ?
      `,
      [name, Number(price), category || "", image || "", description || "", id]
    );

    res.status(200).json({
      success: true,
      message: "Food updated successfully",
    });
  } catch (error) {
    console.log("Update Food Error:", error);

    res.status(500).json({
      success: false,
      message: "Food update failed",
      error: error.message,
    });
  }
};

exports.deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    await runQuery("DELETE FROM foods WHERE id = ?", [id]);

    res.status(200).json({
      success: true,
      message: "Food deleted successfully",
    });
  } catch (error) {
    console.log("Delete Food Error:", error);

    res.status(500).json({
      success: false,
      message: "Food delete failed",
      error: error.message,
    });
  }
};

/* =========================
   WALLETS
========================= */
exports.getWallets = async (req, res) => {
  try {
    const wallets = await runQuery(`
      SELECT
        id,
        name,
        email,
        phone,
        wallet_balance,
        created_at
      FROM users
      ORDER BY id DESC
    `);

    res.status(200).json({
      success: true,
      wallets,
    });
  } catch (error) {
    console.log("Wallets Error:", error);

    res.status(500).json({
      success: false,
      message: "Wallets fetch failed",
      error: error.message,
    });
  }
};

exports.updateWallet = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, amount, note } = req.body;

    const users = await runQuery(
      "SELECT id, wallet_balance FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldBalance = Number(users[0].wallet_balance || 0);
    const walletAmount = Number(amount || 0);

    if (!walletAmount || walletAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    let newBalance = oldBalance;

    if (type === "add") {
      newBalance = oldBalance + walletAmount;
    } else if (type === "deduct") {
      newBalance = oldBalance - walletAmount;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet type",
      });
    }

    if (newBalance < 0) {
      return res.status(400).json({
        success: false,
        message: "Wallet balance cannot be negative",
      });
    }

    await runQuery("UPDATE users SET wallet_balance = ? WHERE id = ?", [
      newBalance,
      userId,
    ]);

    await runQuery(
      `
      INSERT INTO wallet_transactions
      (user_id, type, amount, old_balance, new_balance, payment_method, note)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [userId, type, walletAmount, oldBalance, newBalance, "admin", note || ""]
    );

    res.status(200).json({
      success: true,
      message: "Wallet updated successfully",
      walletBalance: newBalance,
    });
  } catch (error) {
    console.log("Update Wallet Error:", error);

    res.status(500).json({
      success: false,
      message: "Wallet update failed",
      error: error.message,
    });
  }
};

exports.getWalletTransactions = async (req, res) => {
  try {
    const transactions = await runQuery(`
      SELECT 
        wt.*,
        u.name AS user_name,
        u.email AS user_email
      FROM wallet_transactions wt
      LEFT JOIN users u ON wt.user_id = u.id
      ORDER BY wt.id DESC
    `);

    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.log("Wallet Transactions Error:", error);

    res.status(500).json({
      success: false,
      message: "Wallet transactions fetch failed",
      error: error.message,
    });
  }
};

/* =========================
   RIDERS
========================= */
exports.getRiders = async (req, res) => {
  try {
    const riders = await runQuery(`
      SELECT 
        id,
        name,
        phone,
        vehicle,
        TRIM(status) AS status,
        location,
        assigned_order_id,
        created_at
      FROM riders
      ORDER BY id DESC
    `);

    res.status(200).json({
      success: true,
      riders,
    });
  } catch (error) {
    console.log("Riders Error:", error);

    res.status(500).json({
      success: false,
      message: "Riders fetch failed",
      error: error.message,
    });
  }
};

exports.addRider = async (req, res) => {
  try {
    const { name, phone, vehicle, status, location } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Rider name and phone are required",
      });
    }

    await runQuery(
      `
      INSERT INTO riders 
      (name, phone, vehicle, status, location, assigned_order_id)
      VALUES (?, ?, ?, ?, ?, NULL)
      `,
      [
        name.trim(),
        phone.trim(),
        vehicle || "",
        status || "Available",
        location || "",
      ]
    );

    res.status(201).json({
      success: true,
      message: "Rider added successfully",
    });
  } catch (error) {
    console.log("Add Rider Error:", error);

    res.status(500).json({
      success: false,
      message: "Rider add failed",
      error: error.message,
    });
  }
};

exports.updateRider = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, vehicle, status, location } = req.body;

    const riderStatus = status || "Available";

    if (riderStatus === "Available" || riderStatus === "Offline") {
      await runQuery(
        `
        UPDATE riders
        SET name = ?,
            phone = ?,
            vehicle = ?,
            status = ?,
            location = ?,
            assigned_order_id = NULL
        WHERE id = ?
        `,
        [
          name || "",
          phone || "",
          vehicle || "",
          riderStatus,
          location || "",
          id,
        ]
      );
    } else {
      await runQuery(
        `
        UPDATE riders
        SET name = ?,
            phone = ?,
            vehicle = ?,
            status = ?,
            location = ?
        WHERE id = ?
        `,
        [
          name || "",
          phone || "",
          vehicle || "",
          riderStatus,
          location || "",
          id,
        ]
      );
    }

    res.status(200).json({
      success: true,
      message: "Rider updated successfully",
    });
  } catch (error) {
    console.log("Update Rider Error:", error);

    res.status(500).json({
      success: false,
      message: "Rider update failed",
      error: error.message,
    });
  }
};

exports.deleteRider = async (req, res) => {
  try {
    const { id } = req.params;

    await runQuery("UPDATE orders SET rider_id = NULL WHERE rider_id = ?", [id]);
    await runQuery("DELETE FROM riders WHERE id = ?", [id]);

    res.status(200).json({
      success: true,
      message: "Rider deleted successfully",
    });
  } catch (error) {
    console.log("Delete Rider Error:", error);

    res.status(500).json({
      success: false,
      message: "Rider delete failed",
      error: error.message,
    });
  }
};

exports.assignRider = async (req, res) => {
  try {
    const { orderId, riderId } = req.body;

    if (!orderId || !riderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID and Rider ID are required",
      });
    }

    const riders = await runQuery(
      `
      SELECT *
      FROM riders
      WHERE id = ?
      AND LOWER(TRIM(status)) = 'available'
      AND (assigned_order_id IS NULL OR assigned_order_id = 0)
      `,
      [riderId]
    );

    if (riders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rider is not available",
      });
    }

    await runQuery(
      `
      UPDATE riders
      SET status = 'Available',
          assigned_order_id = NULL
      WHERE assigned_order_id = ?
      `,
      [orderId]
    );

    await runQuery("UPDATE orders SET rider_id = ? WHERE id = ?", [
      riderId,
      orderId,
    ]);

    await runQuery(
      `
      UPDATE riders
      SET status = 'Busy',
          assigned_order_id = ?
      WHERE id = ?
      `,
      [orderId, riderId]
    );

    res.status(200).json({
      success: true,
      message: "Rider assigned successfully",
    });
  } catch (error) {
    console.log("Assign Rider Error:", error);

    res.status(500).json({
      success: false,
      message: "Rider assign failed",
      error: error.message,
    });
  }
};

/* =========================
   ANALYTICS
========================= */
exports.getAnalytics = async (req, res) => {
  try {
    const revenueLast7Days = await runQuery(`
      SELECT 
        DATE(order_date) AS date,
        COALESCE(SUM(total), 0) AS revenue
      FROM orders
      WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      AND status != 'Cancelled ❌'
      GROUP BY DATE(order_date)
      ORDER BY DATE(order_date)
    `);

    const statusCounts = await runQuery(`
      SELECT status, COUNT(*) AS count
      FROM orders
      GROUP BY status
    `);

    const paymentCounts = await runQuery(`
      SELECT payment_method, COUNT(*) AS count
      FROM orders
      GROUP BY payment_method
    `);

    const topFoods = await runQuery(`
      SELECT 
        title AS food_name,
        SUM(quantity) AS quantity,
        SUM(price * quantity) AS revenue
      FROM order_items
      GROUP BY title
      ORDER BY quantity DESC
      LIMIT 5
    `);

    const topCustomers = await runQuery(`
      SELECT
        u.id,
        u.name,
        u.email,
        COUNT(o.id) AS totalOrders,
        COALESCE(SUM(o.total), 0) AS totalSpent
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      GROUP BY u.id, u.name, u.email
      ORDER BY totalSpent DESC
      LIMIT 5
    `);

    res.status(200).json({
      success: true,
      revenueLast7Days,
      statusCounts,
      paymentCounts,
      topFoods,
      topCustomers,
    });
  } catch (error) {
    console.log("Analytics Error:", error);

    res.status(500).json({
      success: false,
      message: "Analytics fetch failed",
      error: error.message,
    });
  }
};