const Razorpay = require("razorpay");
const crypto = require("crypto");
const db = require("../config/db");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const runQuery = async (sql, params = []) => {
  const [rows] = await db.query(sql, params);
  return rows;
};

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

const createFreshBitesOrderFromPaidPayment = async (userId, pendingOrder) => {
  const {
    name,
    phone,
    address,
    city,
    state,
    pinCode,
    paymentMethod = "upi",
    cartItems,
    subtotal,
    gst,
    deliveryFee,
    discount,
    total,
  } = pendingOrder;

  if (!cartItems || cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  const users = await runQuery(
    "SELECT id, email FROM users WHERE id = ?",
    [userId]
  );

  if (users.length === 0) {
    throw new Error("User not found");
  }

  const user = users[0];

  const activeOrders = await runQuery(
    `SELECT id FROM orders
     WHERE user_id = ?
     AND is_active = 1
     AND status NOT IN ('Delivered ✅', 'Cancelled ❌')`,
    [userId]
  );

  if (activeOrders.length > 0) {
    throw new Error("You already have one active order");
  }

  const availableRiders = await runQuery(
    `SELECT id, name, phone, vehicle
     FROM riders
     WHERE LOWER(TRIM(status)) = 'available'
     AND (assigned_order_id IS NULL OR assigned_order_id = 0)
     ORDER BY id ASC
     LIMIT 1`
  );

  const rider = availableRiders.length > 0 ? availableRiders[0] : null;
  const riderId = rider ? rider.id : null;

  const result = await runQuery(
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

  const orderId = result.insertId;

  for (const item of cartItems) {
    await runQuery(
      `INSERT INTO order_items
       (order_id, food_id, title, price, quantity, image)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        String(item.id || item.dbId || item.food_id || ""),
        item.title || item.name || "",
        Number(item.price || 0),
        Number(item.quantity || item.qty || 1),
        item.image || "",
      ]
    );
  }

  if (riderId) {
    await runQuery(
      `UPDATE riders
       SET status = 'Busy',
           assigned_order_id = ?
       WHERE id = ?`,
      [orderId, riderId]
    );
  }

  const orders = await runQuery(
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

  const items = await runQuery(
    "SELECT * FROM order_items WHERE order_id = ?",
    [orderId]
  );

  return formatOrderResponse(orders[0], items);
};

/* =========================
   CREATE RAZORPAY ORDER
========================= */
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const pendingOrder = req.body.order || req.body;

    const amount = Number(
      req.body.amount || pendingOrder.total || pendingOrder.amount || 0
    );

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    if (!pendingOrder.cartItems || pendingOrder.cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const receipt = `FB_${userId}_${Date.now()}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
      notes: {
        user_id: String(userId),
        app: "Fresh Bites",
      },
    });

    await runQuery(
      `INSERT INTO payment_orders
       (
        receipt,
        razorpay_order_id,
        user_id,
        amount,
        currency,
        status,
        pending_order_json
       )
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        receipt,
        razorpayOrder.id,
        userId,
        amount,
        "INR",
        "created",
        JSON.stringify(pendingOrder),
      ]
    );

    res.status(201).json({
      success: true,
      message: "Razorpay order created",
      keyId: process.env.RAZORPAY_KEY_ID,
      receipt,
      razorpayOrder,
      order: razorpayOrder,
    });
  } catch (error) {
    console.log("Create Razorpay Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Payment order create failed",
      error: error.message,
    });
  }
};

/* =========================
   VERIFY FRONTEND PAYMENT SUCCESS
   This is useful for Razorpay Checkout success callback.
========================= */
exports.verifyPayment = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data missing",
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const paymentRows = await runQuery(
      "SELECT * FROM payment_orders WHERE razorpay_order_id = ? AND user_id = ?",
      [razorpay_order_id, userId]
    );

    if (paymentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    const paymentRecord = paymentRows[0];

    if (paymentRecord.freshbites_order_id) {
      const existingOrders = await runQuery(
        `SELECT
          o.*,
          r.name AS rider_name,
          r.phone AS rider_phone,
          r.vehicle AS rider_vehicle
         FROM orders o
         LEFT JOIN riders r ON o.rider_id = r.id
         WHERE o.id = ?`,
        [paymentRecord.freshbites_order_id]
      );

      const existingItems = await runQuery(
        "SELECT * FROM order_items WHERE order_id = ?",
        [paymentRecord.freshbites_order_id]
      );

      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order: formatOrderResponse(existingOrders[0], existingItems),
      });
    }

    const pendingOrder = JSON.parse(paymentRecord.pending_order_json || "{}");

    const freshBitesOrder = await createFreshBitesOrderFromPaidPayment(
      userId,
      pendingOrder
    );

    await runQuery(
      `UPDATE payment_orders
       SET status = 'paid',
           razorpay_payment_id = ?,
           freshbites_order_id = ?,
           paid_at = NOW()
       WHERE razorpay_order_id = ?`,
      [razorpay_payment_id, freshBitesOrder.orderId, razorpay_order_id]
    );

    res.status(200).json({
      success: true,
      message: "Payment verified and order placed",
      order: freshBitesOrder,
    });
  } catch (error) {
    console.log("Verify Payment Error:", error);

    res.status(500).json({
      success: false,
      message: "Payment verify failed",
      error: error.message,
    });
  }
};

/* =========================
   RAZORPAY WEBHOOK
   Razorpay will call this automatically after payment.
========================= */
exports.razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(500).json({
        success: false,
        message: "Webhook secret missing",
      });
    }

    const signature = req.headers["x-razorpay-signature"];

    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : req.rawBody || JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const event = JSON.parse(rawBody);

    const eventName = event.event;

    if (
      eventName !== "payment.captured" &&
      eventName !== "order.paid"
    ) {
      return res.status(200).json({
        success: true,
        message: "Webhook ignored",
      });
    }

    const paymentEntity = event.payload?.payment?.entity || null;
    const orderEntity = event.payload?.order?.entity || null;

    const razorpayOrderId =
      paymentEntity?.order_id || orderEntity?.id || null;

    const razorpayPaymentId = paymentEntity?.id || "";

    if (!razorpayOrderId) {
      return res.status(200).json({
        success: true,
        message: "No order id in webhook",
      });
    }

    const paymentRows = await runQuery(
      "SELECT * FROM payment_orders WHERE razorpay_order_id = ?",
      [razorpayOrderId]
    );

    if (paymentRows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Payment record not found, webhook ignored",
      });
    }

    const paymentRecord = paymentRows[0];

    if (paymentRecord.freshbites_order_id) {
      return res.status(200).json({
        success: true,
        message: "Order already placed",
      });
    }

    const pendingOrder = JSON.parse(paymentRecord.pending_order_json || "{}");

    const freshBitesOrder = await createFreshBitesOrderFromPaidPayment(
      paymentRecord.user_id,
      pendingOrder
    );

    await runQuery(
      `UPDATE payment_orders
       SET status = 'paid',
           razorpay_payment_id = ?,
           freshbites_order_id = ?,
           paid_at = NOW()
       WHERE razorpay_order_id = ?`,
      [razorpayPaymentId, freshBitesOrder.orderId, razorpayOrderId]
    );

    res.status(200).json({
      success: true,
      message: "Webhook payment received and order placed",
    });
  } catch (error) {
    console.log("Razorpay Webhook Error:", error);

    res.status(500).json({
      success: false,
      message: "Webhook failed",
      error: error.message,
    });
  }
};

/* =========================
   CHECK PAYMENT STATUS
   Frontend can poll this every 3 seconds.
========================= */
exports.getPaymentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const paymentRows = await runQuery(
      `SELECT *
       FROM payment_orders
       WHERE user_id = ?
       AND (razorpay_order_id = ? OR receipt = ?)`,
      [userId, id, id]
    );

    if (paymentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    const paymentRecord = paymentRows[0];

    let order = null;

    if (paymentRecord.freshbites_order_id) {
      const orders = await runQuery(
        `SELECT
          o.*,
          r.name AS rider_name,
          r.phone AS rider_phone,
          r.vehicle AS rider_vehicle
         FROM orders o
         LEFT JOIN riders r ON o.rider_id = r.id
         WHERE o.id = ?`,
        [paymentRecord.freshbites_order_id]
      );

      const items = await runQuery(
        "SELECT * FROM order_items WHERE order_id = ?",
        [paymentRecord.freshbites_order_id]
      );

      if (orders.length > 0) {
        order = formatOrderResponse(orders[0], items);
      }
    }

    res.status(200).json({
      success: true,
      paymentStatus: paymentRecord.status,
      razorpayOrderId: paymentRecord.razorpay_order_id,
      razorpayPaymentId: paymentRecord.razorpay_payment_id,
      freshbitesOrderId: paymentRecord.freshbites_order_id,
      order,
    });
  } catch (error) {
    console.log("Payment Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Payment status fetch failed",
      error: error.message,
    });
  }
};