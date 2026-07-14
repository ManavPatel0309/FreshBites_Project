import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OrderPopup = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  const loadOrder = () => {
    try {
      const currentOrder = JSON.parse(
        localStorage.getItem("currentOrder")
      );

      if (
        currentOrder &&
        currentOrder.isActive === true &&
        currentOrder.status !== "Cancelled ❌" &&
        currentOrder.status !== "Delivered ✅"
      ) {
        setOrder(currentOrder);
      } else {
        setOrder(null);
      }
    } catch (error) {
      setOrder(null);
    }
  };

  useEffect(() => {
    loadOrder();

    window.addEventListener("storage", loadOrder);
    window.addEventListener("orderUpdated", loadOrder);

    const interval = setInterval(loadOrder, 1000);

    return () => {
      window.removeEventListener("storage", loadOrder);
      window.removeEventListener("orderUpdated", loadOrder);
      clearInterval(interval);
    };
  }, []);

  const cancelOrder = () => {
    if (!order) {
      alert("No active order found");
      return;
    }

    const cancelledOrder = {
      ...order,
      status: "Cancelled ❌",
      isActive: false,
      cancelledAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "currentOrder",
      JSON.stringify(cancelledOrder)
    );

    const orders =
      JSON.parse(localStorage.getItem("orders")) || [];

    const updatedOrders = orders.map((item) =>
      item.orderId === cancelledOrder.orderId
        ? cancelledOrder
        : item
    );

    localStorage.setItem(
      "orders",
      JSON.stringify(updatedOrders)
    );

    setOrder(null);
    window.dispatchEvent(new Event("orderUpdated"));

    alert("Order Cancelled Successfully ❌");
  };

  if (!order) return null;

  return (
    <div className="order-popup">
      <h3>🚚 Active Order</h3>

      <p>Status: {order.status}</p>

      <p>
        Total: ₹{Number(order.total || 0).toFixed(2)}
      </p>

      <div className="order-popup-btns">
        <button onClick={() => navigate("/tracking")}>
          Track
        </button>

        <button onClick={cancelOrder}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default OrderPopup;