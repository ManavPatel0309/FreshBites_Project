import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminOrders = () => {
  const navigate = useNavigate();

  const API_URL = `${process.env.REACT_APP_API || "http://localhost:5000"}/api/admin/orders`;

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getAdminToken = () => {
    return localStorage.getItem("adminToken");
  };

  useEffect(() => {
    const adminToken = getAdminToken();

    if (!adminToken) {
      navigate("/admin-login");
      return;
    }

    loadOrders();
  }, [navigate]);

  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin-login");
  };

  const normalizeOrder = (order) => {
    return {
      ...order,
      orderId: order.orderId || order.id,
      name:
        order.name ||
        order.customerName ||
        order.customer_name ||
        order.user_name ||
        "N/A",
      phone: order.phone || "N/A",
      address: order.address || "",
      city: order.city || "",
      state: order.state || "",
      pinCode: order.pinCode || order.pin_code || "",
      paymentMethod: order.paymentMethod || order.payment_method || "",
      deliveryFee: order.deliveryFee || order.delivery_fee || 0,
      orderDate: order.orderDate || order.order_date || order.created_at || "",
      riderName: order.riderName || order.rider_name || "",
      riderPhone: order.riderPhone || order.rider_phone || "",
      riderVehicle: order.riderVehicle || order.rider_vehicle || "",
      cartItems: order.cartItems || order.items || [],
      items: order.items || order.cartItems || [],
      isActive:
        order.isActive === true ||
        order.is_active === true ||
        order.is_active === 1 ||
        order.is_active === "1",
    };
  };

  const loadOrders = async () => {
    try {
      const adminToken = getAdminToken();

      if (!adminToken) {
        navigate("/admin-login");
        return;
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        const finalOrders = (data.orders || []).map(normalizeOrder);
        setOrders(finalOrders);
      } else {
        alert(data.message || "Orders fetch failed");

        if (
          data.message === "Invalid or expired admin token" ||
          data.message === "Admin token missing"
        ) {
          logoutAdmin();
        }
      }
    } catch (error) {
      console.log("Load Orders Error:", error);
      alert("Server Error while loading orders");
    }
  };

  const handleStatusChange = async (order, newStatus) => {
    try {
      const adminToken = getAdminToken();

      if (!adminToken) {
        logoutAdmin();
        return;
      }

      const response = await fetch(`${API_URL}/${order.orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Order status updated in MySQL ✅");

        setOrders((prevOrders) =>
          prevOrders.map((item) =>
            Number(item.orderId) === Number(order.orderId)
              ? normalizeOrder({
                  ...item,
                  status: newStatus,
                  is_active:
                    newStatus !== "Delivered ✅" &&
                    newStatus !== "Cancelled ❌"
                      ? 1
                      : 0,
                })
              : item
          )
        );

        if (
          selectedOrder &&
          Number(selectedOrder.orderId) === Number(order.orderId)
        ) {
          setSelectedOrder(
            normalizeOrder({
              ...selectedOrder,
              status: newStatus,
              is_active:
                newStatus !== "Delivered ✅" &&
                newStatus !== "Cancelled ❌"
                  ? 1
                  : 0,
            })
          );
        }

        loadOrders();
      } else {
        alert(data.message || "Order status update failed");
      }
    } catch (error) {
      console.log("Update Status Error:", error);
      alert("Server Error while updating order status");
    }
  };

  const handleDeleteOrder = async (order) => {
    const confirmDelete = window.confirm(
      `Delete order #${order.orderId} permanently from MySQL?`
    );

    if (!confirmDelete) return;

    try {
      const adminToken = getAdminToken();

      if (!adminToken) {
        logoutAdmin();
        return;
      }

      const response = await fetch(`${API_URL}/${order.orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert("Order deleted from MySQL ✅");
        setSelectedOrder(null);
        loadOrders();
      } else {
        alert(data.message || "Order delete failed");
      }
    } catch (error) {
      console.log("Delete Order Error:", error);
      alert("Server Error while deleting order");
    }
  };

  const handleLogout = () => {
    logoutAdmin();
  };

  const filteredOrders = orders.filter((order) => {
    const searchText = `
      ${order.orderId || ""}
      ${order.name || ""}
      ${order.customer_name || ""}
      ${order.user_name || ""}
      ${order.phone || ""}
      ${order.paymentMethod || ""}
      ${order.status || ""}
      ${order.riderName || ""}
    `.toLowerCase();

    const matchSearch = searchText.includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <h2>Fresh Bites</h2>
        <p>Admin Panel</p>

        <nav>
          <Link to="/admin/dashboard">📊 Dashboard</Link>
          <Link to="/admin/users">👤 Users</Link>
          <Link to="/admin/orders">📦 Orders</Link>
          <Link to="/admin/foods">🍔 Foods</Link>
          <Link to="/admin/wallet">💰 Wallet</Link>
          <Link to="/admin/riders">🚴 Riders</Link>
          <Link to="/admin/analytics">📈 Analytics</Link>
        </nav>

        <button className="admin-logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1>📦 Orders</h1>
            <p>Manage permanent MySQL customer orders</p>
          </div>

          <button type="button" onClick={loadOrders}>
            🔄 Refresh
          </button>
        </div>

        <div className="admin-section">
          <div className="admin-topbar">
            <h2>All Orders</h2>

            <div className="admin-filter-box">
              <input
                type="text"
                placeholder="Search order, customer, phone, rider..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Preparing 🍳">Preparing</option>
                <option value="Picked Up 📦">Picked Up</option>
                <option value="On The Way 🚴">On The Way</option>
                <option value="Delivered ✅">Delivered</option>
                <option value="Cancelled ❌">Cancelled</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Rider</th>
                  <th>Status</th>
                  <th>Change Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>#{order.orderId}</td>

                    <td>{order.name || "N/A"}</td>

                    <td>{order.phone || "N/A"}</td>

                    <td>
                      {order.paymentMethod
                        ? order.paymentMethod.toUpperCase()
                        : "N/A"}
                    </td>

                    <td>₹{Number(order.total || 0).toFixed(2)}</td>

                    <td>
                      {order.riderName ? (
                        <>
                          <strong>{order.riderName}</strong>
                          <br />
                          <small>{order.riderPhone || "No phone"}</small>
                        </>
                      ) : (
                        "Not Assigned"
                      )}
                    </td>

                    <td>
                      <span
                        className={
                          order.status === "Delivered ✅"
                            ? "admin-status delivered"
                            : order.status === "Cancelled ❌"
                            ? "admin-status cancelled"
                            : "admin-status active"
                        }
                      >
                        {order.status || "Preparing 🍳"}
                      </span>
                    </td>

                    <td>
                      <select
                        value={order.status || "Preparing 🍳"}
                        onChange={(e) =>
                          handleStatusChange(order, e.target.value)
                        }
                      >
                        <option value="Preparing 🍳">Preparing 🍳</option>
                        <option value="Picked Up 📦">Picked Up 📦</option>
                        <option value="On The Way 🚴">On The Way 🚴</option>
                        <option value="Delivered ✅">Delivered ✅</option>
                        <option value="Cancelled ❌">Cancelled ❌</option>
                      </select>
                    </td>

                    <td>
                      <div className="admin-action-buttons">
                        <button
                          type="button"
                          className="admin-view-btn"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() => handleDeleteOrder(order)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedOrder && (
          <div className="admin-modal-overlay">
            <div className="admin-modal admin-order-modal">
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                ✖
              </button>

              <h2>📦 Order Details</h2>

              <p>
                <strong>Order ID:</strong> #{selectedOrder.orderId}
              </p>

              <p>
                <strong>Name:</strong> {selectedOrder.name || "N/A"}
              </p>

              <p>
                <strong>Phone:</strong> {selectedOrder.phone || "N/A"}
              </p>

              <p>
                <strong>Address:</strong>{" "}
                {selectedOrder.address || "N/A"}, {selectedOrder.city || ""},{" "}
                {selectedOrder.state || ""} - {selectedOrder.pinCode || ""}
              </p>

              <p>
                <strong>Payment:</strong>{" "}
                {selectedOrder.paymentMethod
                  ? selectedOrder.paymentMethod.toUpperCase()
                  : "N/A"}
              </p>

              <p>
                <strong>Status:</strong> {selectedOrder.status || "Preparing 🍳"}
              </p>

              <p>
                <strong>Rider:</strong>{" "}
                {selectedOrder.riderName || "Not Assigned"}
              </p>

              <p>
                <strong>Rider Phone:</strong>{" "}
                {selectedOrder.riderPhone || "N/A"}
              </p>

              <p>
                <strong>Vehicle:</strong>{" "}
                {selectedOrder.riderVehicle || "N/A"}
              </p>

              <p>
                <strong>Subtotal:</strong> ₹
                {Number(selectedOrder.subtotal || 0).toFixed(2)}
              </p>

              <p>
                <strong>GST:</strong> ₹
                {Number(selectedOrder.gst || 0).toFixed(2)}
              </p>

              <p>
                <strong>Delivery Fee:</strong> ₹
                {Number(selectedOrder.deliveryFee || 0).toFixed(2)}
              </p>

              <p>
                <strong>Discount:</strong> ₹
                {Number(selectedOrder.discount || 0).toFixed(2)}
              </p>

              <p>
                <strong>Total:</strong> ₹
                {Number(selectedOrder.total || 0).toFixed(2)}
              </p>

              <p>
                <strong>Order Date:</strong>{" "}
                {selectedOrder.orderDate
                  ? new Date(selectedOrder.orderDate).toLocaleString()
                  : "N/A"}
              </p>

              <h3>🍔 Items</h3>

              {selectedOrder.cartItems?.length > 0 ? (
                selectedOrder.cartItems.map((item, index) => (
                  <div className="admin-order-item" key={index}>
                    <span>
                      {item.title || item.name || item.food_name || "Food Item"}
                    </span>

                    <span>
                      {item.quantity || item.qty || 1} × ₹
                      {Number(item.price || 0).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p>No items found.</p>
              )}

              <div className="admin-action-buttons">
                <button
                  type="button"
                  className="admin-delete-btn"
                  onClick={() => handleDeleteOrder(selectedOrder)}
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrders;