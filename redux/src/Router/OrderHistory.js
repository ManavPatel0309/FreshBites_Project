import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);

  const loadOrders = () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser) {
      navigate("/login");
      return;
    }

    setUser(savedUser);

    const userId = savedUser.id || savedUser.email || "guest";
    const orderKey = `orders_${userId}`;

    const userOrders = JSON.parse(localStorage.getItem(orderKey)) || [];
    setOrders(userOrders);
  };

  useEffect(() => {
    loadOrders();

    window.addEventListener("storage", loadOrders);
    window.addEventListener("orderUpdated", loadOrders);
    window.addEventListener("profileUpdated", loadOrders);

    return () => {
      window.removeEventListener("storage", loadOrders);
      window.removeEventListener("orderUpdated", loadOrders);
      window.removeEventListener("profileUpdated", loadOrders);
    };
  }, []);

  const handleTrackOrder = (order) => {
    const userId = user?.id || user?.email || "guest";

    localStorage.setItem(
      `currentOrder_${userId}`,
      JSON.stringify(order)
    );

    localStorage.setItem("currentOrder", JSON.stringify(order));

    navigate("/tracking");
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>📦 Order History</h2>

        {orders.length === 0 ? (
          <p>No Orders Found</p>
        ) : (
          orders
            .slice()
            .reverse()
            .map((order, index) => (
              <div key={order.orderId || index} className="order-box">
                <h4>Order #{order.orderId || index + 1}</h4>

                <p>
                  <strong>Date:</strong>{" "}
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleString()
                    : "N/A"}
                </p>

                {order.cancelledAt && (
                  <p>
                    <strong>Cancelled At:</strong>{" "}
                    {new Date(order.cancelledAt).toLocaleString()}
                  </p>
                )}

                {order.deliveredAt && (
                  <p>
                    <strong>Delivered At:</strong>{" "}
                    {new Date(order.deliveredAt).toLocaleString()}
                  </p>
                )}

                <p>
                  <strong>Name:</strong> {order.name || "N/A"}
                </p>

                <p>
                  <strong>Phone:</strong> {order.phone || "N/A"}
                </p>

                <p>
                  <strong>Address:</strong>{" "}
                  {order.address || "N/A"}, {order.city || ""},{" "}
                  {order.state || ""} - {order.pinCode || ""}
                </p>

                <p>
                  <strong>Payment:</strong>{" "}
                  {order.paymentMethod?.toUpperCase() || "N/A"}
                </p>

                <p>
                  <strong>Total:</strong> ₹
                  {Number(order.total || 0).toFixed(2)}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      order.status === "Cancelled ❌"
                        ? "status-cancelled"
                        : order.status === "Delivered ✅"
                        ? "status-delivered"
                        : "status-active"
                    }
                  >
                    {order.status || "Preparing 🍳"}
                  </span>
                </p>

                {order.cartItems?.length > 0 && (
                  <div className="order-items">
                    <strong>Items:</strong>

                    {order.cartItems.map((item, i) => (
                      <p key={i}>
                        {item.title || item.name} ×{" "}
                        {item.quantity || item.qty || 1} - ₹
                        {Number(item.price || 0).toFixed(2)}
                      </p>
                    ))}
                  </div>
                )}

                {order.isActive &&
                  order.status !== "Cancelled ❌" &&
                  order.status !== "Delivered ✅" && (
                    <button
                      className="track-order-btn"
                      onClick={() => handleTrackOrder(order)}
                    >
                      🚚 Track Order
                    </button>
                  )}
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default OrderHistory;