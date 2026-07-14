import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../Store/cartSlice";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.items || []);

  const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
  };

  const getUserKeys = () => {
    const user = getCurrentUser();
    const userId = user?.id || user?.email || "guest";

    return {
      userId,
      orderKey: `orders_${userId}`,
      currentOrderKey: `currentOrder_${userId}`,
      savedAddressKey: `savedAddress_${userId}`,
      pendingOrderKey: `pendingOrder_${userId}`,
    };
  };

  const { savedAddressKey } = getUserKeys();

  const savedAddress =
    JSON.parse(localStorage.getItem(savedAddressKey)) || {};

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotal = cartItems.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity || item.qty) || 0;
    return total + price * qty;
  }, 0);

  const gst = subtotal * 0.05;
  const deliveryFee = cartItems.length > 0 ? 30 : 0;
  const discount = subtotal >= 500 ? 50 : 0;
  const total = subtotal + gst + deliveryFee - discount;

  const handleClearCart = () => {
    dispatch(clearCart());
    localStorage.removeItem("cartItems");
  };

  const saveOrderLocal = (orderData) => {
    const { orderKey, currentOrderKey } = getUserKeys();

    const oldOrders = JSON.parse(localStorage.getItem(orderKey)) || [];

    const exists = oldOrders.some(
      (order) => Number(order.orderId) === Number(orderData.orderId)
    );

    const updatedOrders = exists
      ? oldOrders.map((order) =>
          Number(order.orderId) === Number(orderData.orderId)
            ? orderData
            : order
        )
      : [...oldOrders, orderData];

    localStorage.setItem(orderKey, JSON.stringify(updatedOrders));
    localStorage.setItem(currentOrderKey, JSON.stringify(orderData));
    localStorage.setItem("currentOrder", JSON.stringify(orderData));
  };

  const placeBackendOrder = async (orderData) => {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    return await response.json();
  };

  const handleOrder = async (e) => {
    e.preventDefault();

    if (loading) return;

    const user = getCurrentUser();
    const token = localStorage.getItem("token");

    if (!user || !token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (!cartItems.length) {
      alert("Cart is empty!");
      return;
    }

    const { userId, savedAddressKey, pendingOrderKey } = getUserKeys();

    if (paymentMethod === "upi" && !upiId.trim()) {
      alert("Please enter UPI ID");
      return;
    }

    if (
      paymentMethod === "card" &&
      (!cardNumber.trim() || !expiry.trim() || !cvv.trim())
    ) {
      alert("Please enter complete card details");
      return;
    }

    if (paymentMethod === "card") {
      if (cardNumber.length !== 16) {
        alert("Card number must be 16 digits");
        return;
      }

      if (cvv.length !== 3) {
        alert("CVV must be 3 digits");
        return;
      }
    }

    const form = e.target;

    const addressData = {
      name: form.name.value,
      phone: form.phone.value,
      address: form.address.value,
      city: form.city.value,
      state: form.state.value,
      pinCode: form.pinCode.value,
    };

    localStorage.setItem(savedAddressKey, JSON.stringify(addressData));

    const orderPayload = {
      userId,
      userEmail: user.email || "",
      ...addressData,
      paymentMethod,
      upiId: paymentMethod === "upi" ? upiId : "",
      cardNumber:
        paymentMethod === "card"
          ? `**** **** **** ${cardNumber.slice(-4)}`
          : "",
      cartItems: cartItems.map((item) => ({
        id: item.dbId || item.id,
        title: item.title || item.name,
        name: item.name || item.title,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || item.qty || 1),
        image: item.image || "",
      })),
      subtotal,
      gst,
      deliveryFee,
      discount,
      total,
    };

    if (paymentMethod === "upi" || paymentMethod === "card") {
      localStorage.setItem(pendingOrderKey, JSON.stringify(orderPayload));
      localStorage.setItem("pendingOrder", JSON.stringify(orderPayload));
      navigate("/payment");
      return;
    }

    try {
      setLoading(true);

      const data = await placeBackendOrder(orderPayload);

      if (data.success) {
        const backendOrder = data.order;

        const finalOrder = {
          ...orderPayload,
          ...backendOrder,
          orderId: backendOrder.orderId || backendOrder.id,
          cartItems:
            backendOrder.cartItems || backendOrder.items || orderPayload.cartItems,
          status: backendOrder.status || "Preparing 🍳",
          isActive:
            backendOrder.is_active !== undefined
              ? Boolean(backendOrder.is_active)
              : true,
          orderDate:
            backendOrder.order_date ||
            backendOrder.orderDate ||
            new Date().toISOString(),
          riderName: backendOrder.rider_name || "",
          riderPhone: backendOrder.rider_phone || "",
          riderVehicle: backendOrder.rider_vehicle || "",
        };

        saveOrderLocal(finalOrder);

        if (paymentMethod === "wallet") {
          const oldBalance = Number(localStorage.getItem("walletBalance")) || 0;
          const newBalance = Math.max(oldBalance - total, 0);

          localStorage.setItem("walletBalance", String(newBalance));

          const oldUser = JSON.parse(localStorage.getItem("user")) || {};
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...oldUser,
              walletBalance: newBalance,
            })
          );

          window.dispatchEvent(new Event("profileUpdated"));
          window.dispatchEvent(new Event("walletUpdated"));
        }

        localStorage.removeItem(pendingOrderKey);
        localStorage.removeItem("pendingOrder");

        handleClearCart();

        window.dispatchEvent(new Event("orderUpdated"));

        alert(
          finalOrder.riderName
            ? `Order placed ✅ Rider assigned: ${finalOrder.riderName}`
            : "Order placed ✅ No rider available right now"
        );

        navigate("/tracking");
      } else {
        alert(data.message || "Order failed");
      }
    } catch (error) {
      console.log("Checkout Order Error:", error);
      alert("Server Error while placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="foods-container">
        <div className="foods-header">Checkout</div>

        <div className="checkout-container">
          <div className="checkout-form">
            <h3>Delivery Address</h3>

            <form onSubmit={handleOrder}>
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                defaultValue={savedAddress.name || ""}
                required
              />

              <input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                defaultValue={savedAddress.phone || ""}
                required
              />

              <textarea
                name="address"
                placeholder="Full Address"
                defaultValue={savedAddress.address || ""}
                required
              />

              <input
                name="city"
                type="text"
                placeholder="City"
                defaultValue={savedAddress.city || ""}
                required
              />

              <input
                name="state"
                type="text"
                placeholder="State"
                defaultValue={savedAddress.state || ""}
                required
              />

              <input
                name="pinCode"
                type="text"
                placeholder="Pin Code"
                defaultValue={savedAddress.pinCode || ""}
                required
              />

              <h3>Payment Method</h3>

              <div className="payment-options">
                <label>
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Cash on Delivery
                </label>

                <label>
                  <input
                    type="radio"
                    value="upi"
                    checked={paymentMethod === "upi"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  UPI / Google Pay / PhonePe
                </label>

                <label>
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Credit / Debit Card
                </label>

                <label>
                  <input
                    type="radio"
                    value="wallet"
                    checked={paymentMethod === "wallet"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Wallet
                </label>
              </div>

              {paymentMethod === "upi" && (
                <input
                  type="text"
                  placeholder="Enter UPI ID"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required
                />
              )}

              {paymentMethod === "card" && (
                <>
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(e.target.value.replace(/\D/g, ""))
                    }
                    maxLength="16"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Expiry MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    maxLength="5"
                    required
                  />

                  <input
                    type="password"
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, ""))
                    }
                    maxLength="3"
                    required
                  />
                </>
              )}

              {paymentMethod === "wallet" && (
                <p>
                  Wallet Balance: ₹
                  {Number(localStorage.getItem("walletBalance") || 0).toFixed(
                    2
                  )}
                </p>
              )}

              <button type="submit" className="payment-btn" disabled={loading}>
                {loading
                  ? "Placing Order..."
                  : paymentMethod === "cod" || paymentMethod === "wallet"
                  ? `Place Order ₹${total.toFixed(2)}`
                  : `Proceed to Payment ₹${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          <div className="checkout-summary">
            <div className="summary-box">
              <h3>Order Summary</h3>

              <p>
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </p>

              <p>
                <span>GST 5%:</span>
                <span>₹{gst.toFixed(2)}</span>
              </p>

              <p>
                <span>Delivery Fee:</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </p>

              <p>
                <span>Discount:</span>
                <span>- ₹{discount.toFixed(2)}</span>
              </p>

              <hr />

              <h3>
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;