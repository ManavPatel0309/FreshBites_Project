import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const API_URL = `${process.env.REACT_APP_API || "http://localhost:5000"}/api/admin/dashboard`;
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalFoods: 0,
    totalRiders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);

  const getAdminToken = () => {
    return localStorage.getItem("adminToken");
  };

  useEffect(() => {
    const adminToken = getAdminToken();

    if (!adminToken) {
      navigate("/admin-login");
      return;
    }

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
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
        setStats({
          totalOrders: Number(data.stats?.totalOrders || 0),
          totalUsers: Number(data.stats?.totalUsers || 0),
          totalFoods: Number(data.stats?.totalFoods || 0),
          totalRiders: Number(data.stats?.totalRiders || 0),
          totalRevenue: Number(data.stats?.totalRevenue || 0),
          activeOrders: Number(data.stats?.activeOrders || 0),
          deliveredOrders: Number(data.stats?.deliveredOrders || 0),
          cancelledOrders: Number(data.stats?.cancelledOrders || 0),
        });

        setRecentOrders(data.recentOrders || []);
      } else {
        alert(data.message || "Dashboard fetch failed");

        if (
          data.message === "Invalid or expired admin token" ||
          data.message === "Admin token missing"
        ) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("admin");
          navigate("/admin-login");
        }
      }
    } catch (error) {
      console.log("Dashboard Error:", error);
      alert("Server Error while loading dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin-login");
  };

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
            <h1>📊 Dashboard</h1>
            <p>Permanent MySQL data overview</p>
          </div>

          <button type="button" onClick={loadDashboardData}>
            🔄 Refresh
          </button>
        </div>

        <div className="admin-cards">
          <div className="admin-card">
            <h3>📦 Total Orders</h3>
            <h2>{stats.totalOrders}</h2>
          </div>

          <div className="admin-card">
            <h3>👤 Total Users</h3>
            <h2>{stats.totalUsers}</h2>
          </div>

          <div className="admin-card">
            <h3>🍔 Total Foods</h3>
            <h2>{stats.totalFoods}</h2>
          </div>

          <div className="admin-card">
            <h3>🚴 Total Riders</h3>
            <h2>{stats.totalRiders}</h2>
          </div>

          <div className="admin-card">
            <h3>💰 Total Revenue</h3>
            <h2>₹{Number(stats.totalRevenue || 0).toFixed(2)}</h2>
          </div>

          <div className="admin-card">
            <h3>🚚 Active Orders</h3>
            <h2>{stats.activeOrders}</h2>
          </div>

          <div className="admin-card">
            <h3>✅ Delivered</h3>
            <h2>{stats.deliveredOrders}</h2>
          </div>

          <div className="admin-card">
            <h3>❌ Cancelled</h3>
            <h2>{stats.cancelledOrders}</h2>
          </div>
        </div>

        <div className="admin-section">
          <h2>Recent Orders</h2>

          {recentOrders.length === 0 ? (
            <p>No recent orders found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Rider</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>

                    <td>
                      {order.customer_name ||
                        order.user_name ||
                        "N/A"}
                    </td>

                    <td>
                      {order.user_email ||
                        order.registered_email ||
                        "N/A"}
                    </td>

                    <td>{order.phone || "N/A"}</td>

                    <td>
                      {order.payment_method
                        ? order.payment_method.toUpperCase()
                        : "N/A"}
                    </td>

                    <td>₹{Number(order.total || 0).toFixed(2)}</td>

                    <td>
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
                    </td>

                    <td>
                      {order.rider_name
                        ? `${order.rider_name} (${order.rider_phone || "N/A"})`
                        : "Not Assigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;