import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { QRCodeCanvas } from "qrcode.react";
import { clearCart } from "../Store/cartSlice";

const OWNER_UPI_ID =
  process.env.REACT_APP_OWNER_UPI_ID || "9979329978@ybl";

const OWNER_NAME =
  process.env.REACT_APP_OWNER_NAME || "Fresh Bites";

const Payment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const safeJsonParse = (value, fallback) => {
    try {
      return JSON.parse(value) || fallback;
    } catch {
      return fallback;
    }
  };

  const getCurrentUser = () => {
    return safeJsonParse(localStorage.getItem("user"), null);
  };

  const getUserKeys = () => {
    const user = getCurrentUser();
    const userId = user?.id || user?.email || "guest";

    return {
      userId,
      orderKey: `orders_${userId}`,
      currentOrderKey: `currentOrder_${userId}`,
      pendingOrderKey: `pendingOrder_${userId}`,
    };
  };

  const { orderKey, currentOrderKey, pendingOrderKey } = getUserKeys();

  const order =
    safeJsonParse(localStorage.getItem(pendingOrderKey), null) ||
    safeJsonParse(localStorage.getItem("pendingOrder"), null) ||
    {};

  const paymentMethod = String(order.paymentMethod || "").toLowerCase();

  const createUpiLink = (amount, orderId) => {
    const params = new URLSearchParams({
      pa: OWNER_UPI_ID,
      pn: OWNER_NAME,
      am: Number(amount || 0).toFixed(2),
      cu: "INR",
      tn: `Fresh Bites Order ${orderId || Date.now()}`,
    });

    return `upi://pay?${params.toString()}`;
  };

  const upiLink = useMemo(() => {
    return createUpiLink(order.total, order.orderId || order.id);
  }, [order.total, order.orderId, order.id]);

  const saveOrderLocal = (orderData) => {
    const oldOrders = safeJsonParse(localStorage.getItem(orderKey), []);

    const exists = oldOrders.some(
      (item) => Number(item.orderId) === Number(orderData.orderId)
    );

    const updatedOrders = exists
      ? oldOrders.map((item) =>
        Number(item.orderId) === Number(orderData.orderId)
          ? orderData
          : item
      )
      : [...oldOrders, orderData];

    localStorage.setItem(orderKey, JSON.stringify(updatedOrders));
    localStorage.setItem(currentOrderKey, JSON.stringify(orderData));
    localStorage.setItem("currentOrder", JSON.stringify(orderData));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    localStorage.removeItem("cartItems");
  };

  const handlePaymentSuccess = async () => {
    try {
      if (loading) return;

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      if (!order || !order.cartItems || order.cartItems.length === 0) {
        alert("No pending order found");
        navigate("/cart");
        return;
      }

      setLoading(true);

      const finalPendingOrder = {
        ...order,
        paymentMethod,
        paymentStatus: paymentMethod === "upi" ? "Paid by UPI" : "Paid",
        ownerUpiId: paymentMethod === "upi" ? OWNER_UPI_ID : "",
        ownerUpiName: paymentMethod === "upi" ? OWNER_NAME : "",
        upiPaymentLink: paymentMethod === "upi" ? upiLink : "",
      };

      const response = await fetch(
        `${process.env.REACT_APP_API || "http://localhost:5000"}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(finalPendingOrder),
        }
      );

      const data = await response.json();

      if (data.success) {
        const backendOrder = data.order;

        const finalOrder = {
          ...finalPendingOrder,
          ...backendOrder,
          orderId: backendOrder.orderId || backendOrder.id,
          cartItems:
            backendOrder.cartItems ||
            backendOrder.items ||
            finalPendingOrder.cartItems,
          items:
            backendOrder.items ||
            backendOrder.cartItems ||
            finalPendingOrder.cartItems,
          status: backendOrder.status || "Preparing 🍳",
          isActive:
            backendOrder.is_active !== undefined
              ? Boolean(backendOrder.is_active)
              : true,
          is_active:
            backendOrder.is_active !== undefined
              ? backendOrder.is_active
              : 1,
          orderDate:
            backendOrder.order_date ||
            backendOrder.orderDate ||
            new Date().toISOString(),
          paymentMethod:
            backendOrder.payment_method ||
            backendOrder.paymentMethod ||
            paymentMethod,
          riderName:
            backendOrder.rider_name ||
            backendOrder.riderName ||
            "",
          riderPhone:
            backendOrder.rider_phone ||
            backendOrder.riderPhone ||
            "",
          riderVehicle:
            backendOrder.rider_vehicle ||
            backendOrder.riderVehicle ||
            "",
        };

        saveOrderLocal(finalOrder);

        localStorage.removeItem(pendingOrderKey);
        localStorage.removeItem("pendingOrder");

        handleClearCart();

        window.dispatchEvent(new Event("orderUpdated"));

        alert(
          finalOrder.riderName
            ? `Payment marked paid ✅ Rider assigned: ${finalOrder.riderName}`
            : "Payment marked paid ✅ Order placed"
        );

        navigate("/tracking");
      } else {
        alert(data.message || "Order place failed");
      }
    } catch (error) {
      console.log("Payment Error:", error);
      alert("Server Error while payment");
    } finally {
      setLoading(false);
    }
  };

  if (!order || !order.total) {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <h2>🚫 No Pending Payment</h2>
          <p>Please checkout again.</p>

          <button
            type="button"
            className="pay-now-btn"
            onClick={() => navigate("/cart")}
          >
            Go To Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h2>💳 Payment</h2>

        <div className="payment-info">
          <p>
            <strong>Payment Method:</strong>{" "}
            {paymentMethod.toUpperCase()}
          </p>

          <p>
            <strong>Order Amount:</strong> ₹
            {Number(order.total || 0).toFixed(2)}
          </p>
        </div>

        {paymentMethod === "upi" && (
          <div className="upi-box">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/UPI-Logo-vector.svg/2560px-UPI-Logo-vector.svg.png"
              alt="UPI"
              width="150"
            />

            <h3>Scan QR Code & Pay</h3>

            <div className="upi-qr-box">
              <QRCodeCanvas value={upiLink} size={230} />
            </div>

            <p>
              Pay To: <strong>{OWNER_NAME}</strong>
            </p>

            <p>
              Owner UPI ID: <strong>{OWNER_UPI_ID}</strong>
            </p>

            <p>
              Amount:{" "}
              <strong>₹{Number(order.total || 0).toFixed(2)}</strong>
            </p>

            <p style={{ color: "green", fontWeight: "bold" }}>
              ✅ After payment, click below button to confirm.
            </p>

            <p style={{ fontSize: "14px" }}>
              This QR code is for website owner payment. Do not enter customer
              UPI ID here.
            </p>
          </div>
        )}

        {paymentMethod === "card" && (
          <div className="card-payment">
            <h3>💳 Card Payment</h3>
            <p>Card payment demo verified successfully.</p>
            <p>
              Card:{" "}
              {order.cardNumber
                ? `**** **** **** ${String(order.cardNumber).slice(-4)}`
                : "N/A"}
            </p>
          </div>
        )}

        <button
          type="button"
          className="pay-now-btn"
          onClick={handlePaymentSuccess}
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : paymentMethod === "upi"
              ? "✅ I Have Paid - Place Order"
              : `Pay ₹${Number(order.total || 0).toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default Payment;