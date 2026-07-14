const db = require("../config/db");

/* =========================
   HELPER: ORDER RESPONSE
========================= */
const formatOrderResponse = (order, items = []) => {
  return {
    ...order,
    orderId: order.id,
    isActive: Boolean(order.is_active),
    orderDate: order.order_date,
    paymentMethod: order.payment_method,
    pinCode: order.pin_code,
    customerName: order.customer_name,
    riderName: order.rider_name || "",
    riderPhone: order.rider_phone || "",
    riderVehicle: order.rider_vehicle || "",
    cartItems: items,
    items,
  };
};

/* =========================
   PLACE ORDER + AUTO RIDER ASSIGN
========================= */
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      phone,
      address,
      city,
      state,
      pinCode,
      paymentMethod,
      cartItems,
      subtotal,
      gst,
      deliveryFee,
      discount,
      total,
    } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const [users] = await db.query(
      "SELECT id, email, wallet_balance FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    const [activeOrders] = await db.query(
      `SELECT id FROM orders
       WHERE user_id = ?
       AND is_active = 1
       AND status NOT IN ('Delivered ✅', 'Cancelled ❌')`,
      [userId]
    );

    if (activeOrders.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already have one active order",
      });
    }

    if (paymentMethod === "wallet") {
      const walletBalance = Number(user.wallet_balance || 0);

      if (walletBalance < Number(total)) {
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance",
        });
      }

      const newBalance = walletBalance - Number(total);

      await db.query("UPDATE users SET wallet_balance = ? WHERE id = ?", [
        newBalance,
        userId,
      ]);

      await db.query(
        `INSERT INTO wallet_transactions
         (user_id, type, amount, old_balance, new_balance, payment_method, note)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          "deduct",
          Number(total),
          walletBalance,
          newBalance,
          "wallet",
          "Order payment",
        ]
      );
    }

   const [availableRiders] = await db.query(
  `SELECT id, name, phone, vehicle
   FROM riders
   WHERE LOWER(TRIM(status)) = 'available'
   AND (assigned_order_id IS NULL OR assigned_order_id = 0)
   ORDER BY id ASC
   LIMIT 1`
);
    const rider = availableRiders.length > 0 ? availableRiders[0] : null;
    const riderId = rider ? rider.id : null;

    const [orderResult] = await db.query(
      `INSERT INTO orders
       (
        user_id,
        user_email,
        customer_name,
        phone,
        address,
        city,
        state,
        pin_code,
        payment_method,
        subtotal,
        gst,
        delivery_fee,
        discount,
        total,
        status,
        is_active,
        rider_id,
        order_date
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        user.email,
        name,
        phone,
        address,
        city,
        state,
        pinCode,
        paymentMethod,
        Number(subtotal || 0),
        Number(gst || 0),
        Number(deliveryFee || 0),
        Number(discount || 0),
        Number(total || 0),
        "Preparing 🍳",
        1,
        riderId,
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await db.query(
        `INSERT INTO order_items
         (order_id, food_id, title, price, quantity, image)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          String(item.id || item.dbId || ""),
          item.title || item.name || "",
          Number(item.price || 0),
          Number(item.quantity || item.qty || 1),
          item.image || "",
        ]
      );
    }

    if (riderId) {
      await db.query(
        `UPDATE riders
         SET status = 'Busy',
             assigned_order_id = ?
         WHERE id = ?`,
        [orderId, riderId]
      );
    }

    const [orders] = await db.query(
      `SELECT
        o.*,
        r.name AS rider_name,
        r.phone AS rider_phone,
        r.vehicle AS rider_vehicle
       FROM orders o
       LEFT JOIN riders r ON o.rider_id = r.id
       WHERE o.id = ?`,
      [orderId]
    );

    const [items] = await db.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [orderId]
    );

    const finalOrder = formatOrderResponse(orders[0], items);

    res.status(201).json({
      success: true,
      message: riderId
        ? "Order placed and rider assigned"
        : "Order placed, no rider available",
      order: finalOrder,
    });
  } catch (error) {
    console.log("Place Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Order place failed",
      error: error.message,
    });
  }
};

/* =========================
   GET MY ORDERS
========================= */
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const [orders] = await db.query(
      `SELECT
        o.*,
        r.name AS rider_name,
        r.phone AS rider_phone,
        r.vehicle AS rider_vehicle
       FROM orders o
       LEFT JOIN riders r ON o.rider_id = r.id
       WHERE o.user_id = ?
       ORDER BY o.id DESC`,
      [userId]
    );

    const [items] = await db.query(
      `SELECT oi.*
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ?`,
      [userId]
    );

    const finalOrders = orders.map((order) => {
      const orderItems = items.filter(
        (item) => Number(item.order_id) === Number(order.id)
      );

      return formatOrderResponse(order, orderItems);
    });

    res.status(200).json({
      success: true,
      orders: finalOrders,
    });
  } catch (error) {
    console.log("Get My Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Orders fetch failed",
      error: error.message,
    });
  }
};

/* =========================
   UPDATE ORDER STATUS
========================= */
exports.updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const [orders] = await db.query(
      "SELECT * FROM orders WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isActive =
      status !== "Delivered ✅" && status !== "Cancelled ❌" ? 1 : 0;

    const deliveredAt = status === "Delivered ✅" ? new Date() : null;
    const cancelledAt = status === "Cancelled ❌" ? new Date() : null;

    await db.query(
      `UPDATE orders
       SET status = ?,
           is_active = ?,
           delivered_at = ?,
           cancelled_at = ?
       WHERE id = ? AND user_id = ?`,
      [status, isActive, deliveredAt, cancelledAt, id, userId]
    );

    if (status === "Delivered ✅" || status === "Cancelled ❌") {
      await db.query(
        `UPDATE riders
         SET status = 'Available',
             assigned_order_id = NULL
         WHERE assigned_order_id = ?`,
        [id]
      );
    }

    const [updatedOrders] = await db.query(
      `SELECT
        o.*,
        r.name AS rider_name,
        r.phone AS rider_phone,
        r.vehicle AS rider_vehicle
       FROM orders o
       LEFT JOIN riders r ON o.rider_id = r.id
       WHERE o.id = ?`,
      [id]
    );

    const [items] = await db.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order: formatOrderResponse(updatedOrders[0], items),
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